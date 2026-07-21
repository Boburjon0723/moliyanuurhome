/**
 * Bot ombor mantiqi — unit testlar (baza kerak emas).
 * node --test test/warehouse-logic.test.js
 */
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

function normBtn(text) {
    return String(text || '')
        .trim()
        .replace(/[\u2212\u2013\u2014]/g, '-')
        .replace(/\s+/g, ' ')
}

const STOCK_OUT_BTN = '📦 Ishlatish (−)'
const STOCK_IN_BTN = '📥 Kirim (+)'
const STOCK_LIST_BTN = '📋 Qoldiq'
const LOW_STOCK_BTN = '⚠️ Kam qoldiq'

function isStockOutBtn(text) {
    const t = normBtn(text).toLowerCase()
    return t === normBtn(STOCK_OUT_BTN).toLowerCase() || t.includes('ishlatish')
}
function isStockInBtn(text) {
    const t = normBtn(text).toLowerCase()
    return t === normBtn(STOCK_IN_BTN).toLowerCase() || (t.includes('kirim') && t.includes('+'))
}
function isStockListBtn(text) {
    const t = normBtn(text).toLowerCase()
    return t === normBtn(STOCK_LIST_BTN).toLowerCase() || t === '📋 qoldiq' || t === 'qoldiq'
}
function isLowStockBtn(text) {
    const t = normBtn(text).toLowerCase()
    return t === normBtn(LOW_STOCK_BTN).toLowerCase() || t.includes('kam qoldiq')
}

function parseQtyInput(text) {
    const n = Number(String(text || '').replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : NaN
}

function stockStatus(material) {
    const stock = Number(material.stock_quantity) || 0
    const min = Number(material.min_stock) || 0
    if (material.track_stock === false) return 'notTracked'
    if (stock <= 0) return 'out'
    if (min > 0 && stock <= min) return 'low'
    return 'ok'
}

function dedupeDepartmentsByName(rows) {
    const seen = new Set()
    const out = []
    for (const d of rows) {
        const name = String(d.name_uz || d.name_ru || d.name_en || '')
            .trim()
            .toLowerCase()
        if (!name) continue
        if (seen.has(name)) continue
        seen.add(name)
        out.push(d)
    }
    return out
}

function lowStockFingerprint(rows) {
    return rows
        .map((r) => `${r.id}:${Number(r.stock_quantity) || 0}:${Number(r.min_stock) || 0}`)
        .sort()
        .join('|')
}

function applyMovePreview(current, action, qty) {
    const c = Number(current) || 0
    const q = Number(qty) || 0
    if (!(q > 0)) throw new Error('qty')
    if (action === 'out' && q > c) throw new Error('yetarli emas')
    const delta = action === 'in' ? q : -q
    return Math.max(0, c + delta)
}

describe('tugma tanish', () => {
    it('Ishlatish Unicode minus bilan', () => {
        assert.equal(isStockOutBtn('📦 Ishlatish (−)'), true)
        assert.equal(isStockOutBtn('📦 Ishlatish (-)'), true)
        assert.equal(isStockOutBtn('Moliya'), false)
    })
    it('Kirim / Qoldiq / Kam', () => {
        assert.equal(isStockInBtn('📥 Kirim (+)'), true)
        assert.equal(isStockListBtn('📋 Qoldiq'), true)
        assert.equal(isLowStockBtn('⚠️ Kam qoldiq'), true)
        assert.equal(isStockInBtn('Kirim chiqimlar Hisob kitob'), false)
    })
})

describe('miqdor parse', () => {
    it('vergul va nuqta', () => {
        assert.equal(parseQtyInput('2'), 2)
        assert.equal(parseQtyInput('2,5'), 2.5)
        assert.equal(parseQtyInput('1.25'), 1.25)
        assert.ok(Number.isNaN(parseQtyInput('abc')))
        assert.equal(parseQtyInput('0') > 0, false)
    })
})

describe('stock status', () => {
    it('out / low / ok', () => {
        assert.equal(stockStatus({ stock_quantity: 0, min_stock: 5, track_stock: true }), 'out')
        assert.equal(stockStatus({ stock_quantity: 3, min_stock: 5, track_stock: true }), 'low')
        assert.equal(stockStatus({ stock_quantity: 5, min_stock: 5, track_stock: true }), 'low')
        assert.equal(stockStatus({ stock_quantity: 10, min_stock: 5, track_stock: true }), 'ok')
        assert.equal(stockStatus({ stock_quantity: 1, min_stock: 0, track_stock: true }), 'ok')
    })
})

describe('bo‘lim dublikat', () => {
    it('iyun oyi bir marta', () => {
        const rows = [
            { id: 1, name_uz: 'iyun oyi' },
            { id: 2, name_uz: 'iyun oyi' },
            { id: 3, name_uz: 'iyun oyi' },
            { id: 4, name_uz: 'iyul oyi' },
        ]
        const out = dedupeDepartmentsByName(rows)
        assert.equal(out.length, 2)
        assert.equal(out[0].id, 1)
        assert.equal(out[1].name_uz, 'iyul oyi')
    })
})

describe('chiqim/kirim hisob', () => {
    it('chiqim kamaytiradi, ortiqcha rad', () => {
        assert.equal(applyMovePreview(10, 'out', 3), 7)
        assert.equal(applyMovePreview(2, 'in', 5), 7)
        assert.throws(() => applyMovePreview(2, 'out', 5))
    })
})

describe('low stock fingerprint', () => {
    it('o‘zgarishni sezadi', () => {
        const a = lowStockFingerprint([
            { id: 'a', stock_quantity: 1, min_stock: 5 },
            { id: 'b', stock_quantity: 0, min_stock: 2 },
        ])
        const b = lowStockFingerprint([
            { id: 'a', stock_quantity: 2, min_stock: 5 },
            { id: 'b', stock_quantity: 0, min_stock: 2 },
        ])
        assert.notEqual(a, b)
        assert.equal(a, lowStockFingerprint([
            { id: 'b', stock_quantity: 0, min_stock: 2 },
            { id: 'a', stock_quantity: 1, min_stock: 5 },
        ]))
    })
})
