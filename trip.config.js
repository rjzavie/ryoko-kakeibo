/**
 * 旅の帳冊 — Trip Configuration
 *
 * 這個檔案是「可選」的外部 override。
 * index.html 內已 inline 一份預設配置，這個檔案會在載入時覆蓋掉預設值。
 * 不需要這個檔案，app 也能正常運作；只是修改旅程要改 index.html 內的 TRIP。
 */
window.TRIP = {
  name: '京阪の記帳',
  short: '京阪',
  start: '2026-05-23',
  end: '2026-05-29',
  currency: { code: 'JPY', symbol: '¥' },
  homeCurrency: { code: 'TWD', symbol: 'NT$' },
  rate: 0.20,
  dailyTips: {
    '2026-05-23': '抵達日 — 出發京都',
    '2026-05-24': 'Costco・錦市場・松本酒造・AEON',
    '2026-05-25': '嵐山・嵯峨野小火車・清水寺',
    '2026-05-26': '伊根舟屋・天橋立',
    '2026-05-27': '臨空 Outlet',
    '2026-05-28': '勝尾寺・神戶',
    '2026-05-29': '歸途 — 返家',
  }
};
