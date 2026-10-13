import assert from 'node:assert/strict'
import test from 'node:test'
import { buildEventMessage, buildRouterCaption, buildRouterResults } from './messageFormatters.js'
import { validateRouter } from './routerValidation.js'

const router = {
  model: 'E3000', routerId: ' 5 ', mode: 'Spillover', provider: 'StarHub / Singtel',
  includeSwitch: false, switchPorts: '8', switchId: '', accessPoints: [], location: '',
}
const form = {
  eventName: ' Test event ', statusUpdate: 'Setup done',
  collectionDate: '', collectionTime: '', notes: '',
}
const accessPoints = [
  { id: 2, cloudId: 'AB12' }, { id: 7, cloudId: 'cd34' }, { id: 9, cloudId: 'EF56' },
]

test('router-only and single-AP captions retain their original format', () => {
  assert.equal(buildRouterCaption(router), 'E3000 - 5\nStarHub / Singtel Spillover')
  assert.equal(buildRouterCaption({ ...router, accessPoints: [accessPoints[0]] }),
    'E3000 - 5 + AP\nStarHub / Singtel Spillover\nAP Cloud ID: AB12')
})

test('one router with a switch and three APs lists every device in the caption and event update', () => {
  const deployed = { ...router, includeSwitch: true, switchPorts: '24', switchId: ' SW-1 ', accessPoints }
  const caption = 'E3000 - 5 + 24-port switch + 3 APs\nStarHub / Singtel Spillover\nSwitch ID: SW-1\nAP 1 Cloud ID: AB12\nAP 2 Cloud ID: cd34\nAP 3 Cloud ID: EF56'
  assert.equal(buildRouterCaption(deployed), caption)
  assert.equal(buildEventMessage(form, [deployed], []),
    `Setup completed for Event @ Test event\n\nRouter: ${caption}`)
})

test('switches work without APs or equipment IDs, and disabled switches are omitted', () => {
  const deployed = { ...router, includeSwitch: true }
  assert.equal(buildRouterCaption(deployed), 'E3000 - 5 + 8-port switch\nStarHub / Singtel Spillover')
  assert.equal(buildRouterCaption({ ...deployed, includeSwitch: false, switchId: 'SW-1' }), buildRouterCaption(router))
})

test('multiple APs work without a switch, with location and SOHO/Round Robin formatting', () => {
  assert.equal(buildRouterCaption({ ...router, model: 'SOHO', accessPoints, location: ' Stage ' }),
    'SOHO - 5 + 3 APs\nStarHub / Singtel\nAP 1 Cloud ID: AB12\nAP 2 Cloud ID: cd34\nAP 3 Cloud ID: EF56\nLocation: Stage')
  assert.equal(buildRouterCaption({ ...router, mode: 'Round Robin' }), 'E3000 - 5\nStarHub / Singtel RR')
})

test('multiple routers keep their own switch and AP details', () => {
  assert.equal(buildEventMessage(form, [
    { ...router, includeSwitch: true, switchId: 'S1', accessPoints: [accessPoints[0]] },
    { ...router, routerId: '6', accessPoints: accessPoints.slice(1) },
  ], []), 'Setup completed for Event @ Test event\n\nRouter 1: E3000 - 5 + 8-port switch + AP\nStarHub / Singtel Spillover\nSwitch ID: S1\nAP Cloud ID: AB12\n\nRouter 2: E3000 - 6 + 2 APs\nStarHub / Singtel Spillover\nAP 1 Cloud ID: cd34\nAP 2 Cloud ID: EF56')
})

test('removing a middle AP renumbers output without losing the remaining IDs', () => {
  assert.equal(buildRouterCaption({ ...router, accessPoints: accessPoints.filter((ap) => ap.id !== 7) }),
    'E3000 - 5 + 2 APs\nStarHub / Singtel Spillover\nAP 1 Cloud ID: AB12\nAP 2 Cloud ID: EF56')
})

test('collection updates omit all equipment and Wi-Fi details', () => {
  assert.equal(buildEventMessage({ ...form, statusUpdate: 'Collection done', notes: ' All collected ' },
    [{ ...router, includeSwitch: true, accessPoints }], [{ ssid: 'test', password: 'secret' }]),
  'Collection completed for Event @ Test event\n\nNotes: All collected')
})

test('AP validation reports every invalid ID by stable key and accepts no APs', () => {
  assert.deepEqual(validateRouter(router), {})
  assert.deepEqual(validateRouter({ ...router, accessPoints }), {})
  assert.deepEqual(validateRouter({ ...router, routerId: ' ', accessPoints: [
    { id: 2, cloudId: '' }, { id: 7, cloudId: 'ab!2' }, { id: 9, cloudId: 'X1234' },
    { id: 10, cloudId: 'ab' }, { id: 11, cloudId: ' ab12 ' },
  ] }), {
    routerId: 'Enter a router ID.',
    accessPoints: {
      2: 'Enter the last 4 letters or numbers.', 7: 'Enter the last 4 letters or numbers.',
      9: 'Enter the last 4 letters or numbers.', 10: 'Enter the last 4 letters or numbers.',
    },
  })
})

test('LAN and Wi-Fi results retain their own images, crops and captions', () => {
  const lanImage = { file: 'lan.png', crop: { x: 0, y: 0, width: 1, height: 1 } }
  const wifiImage = { file: 'wifi.png', crop: { x: 0.2, y: 0, width: 0.8, height: 1 } }
  const deployed = { ...router, id: 1, accessPoints, speedTests: [
    { id: 1, label: ' LAN ', image: lanImage },
    { id: 3, label: 'Wi-Fi via AP AB12', image: wifiImage },
  ] }
  const results = buildRouterResults([deployed])
  assert.deepEqual(results.map((result) => result.id), ['1-1', '1-3'])
  assert.deepEqual(results.map((result) => result.label), ['Router 1 - LAN', 'Router 1 - Wi-Fi via AP AB12'])
  assert.equal(results[0].speedTestImage, lanImage)
  assert.equal(results[1].speedTestImage, wifiImage)
  assert.equal(results[0].caption, `${buildRouterCaption(deployed)}\nSpeed test: LAN`)
  assert.equal(results[1].caption, `${buildRouterCaption(deployed)}\nSpeed test: Wi-Fi via AP AB12`)
  assert.equal(buildEventMessage(form, [deployed], []), buildEventMessage(form, [{ ...router, accessPoints }], []))
})

test('one unlabelled result preserves caption-only behavior; multiple unlabelled results are numbered', () => {
  const blank = { id: 1, label: ' ', image: null }
  const single = buildRouterResults([{ ...router, id: 1, speedTests: [blank] }])
  assert.equal(single[0].caption, buildRouterCaption(router))
  assert.equal(single[0].label, 'Router 1')
  assert.equal(single[0].speedTestImage, null)
  const multiple = buildRouterResults([{ ...router, id: 1, speedTests: [blank, { ...blank, id: 2 }] }])
  assert.match(multiple[0].caption, /Speed test: Speed test 1$/)
  assert.match(multiple[1].caption, /Speed test: Speed test 2$/)
})

test('result keys stay unique across routers and stable after removing another result', () => {
  const tests = [{ id: 1, label: 'LAN', image: null }, { id: 5, label: 'Wi-Fi', image: null }]
  const first = { ...router, id: 1, speedTests: tests }
  const second = { ...router, id: 2, speedTests: [tests[0]] }
  const before = buildRouterResults([first, second])
  assert.equal(new Set(before.map((result) => result.id)).size, 3)
  const after = buildRouterResults([{ ...first, speedTests: [tests[1]] }, second])
  assert.deepEqual(after, before.slice(1))
})
