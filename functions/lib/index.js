"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymongoWebhook = exports.createPaymongoCheckout = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
admin.initializeApp();
const db = admin.firestore();
const region = functions.region('asia-southeast1');
const MIN_PESOS = 20;
const MAX_PESOS = 50000;
exports.createPaymongoCheckout = region.https.onCall(async (data) => {
    const pesos = Number(data?.amount);
    if (!Number.isFinite(pesos) || pesos < MIN_PESOS || pesos > MAX_PESOS) {
        throw new functions.https.HttpsError('invalid-argument', `Amount must be ₱${MIN_PESOS}–₱${MAX_PESOS.toLocaleString()}`);
    }
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const appUrl = process.env.APP_URL ?? 'https://reality-check-ph.web.app';
    if (!secretKey) {
        throw new functions.https.HttpsError('internal', 'PayMongo key not configured');
    }
    const centavos = Math.round(pesos * 100);
    const encoded = Buffer.from(secretKey + ':').toString('base64');
    const response = await axios_1.default.post('https://api.paymongo.com/v1/checkout_sessions', {
        data: {
            attributes: {
                line_items: [{
                        currency: 'PHP',
                        amount: centavos,
                        name: 'Donation — Reality Check + safety app',
                        quantity: 1,
                    }],
                payment_method_types: ['gcash', 'paymaya', 'card', 'grab_pay', 'qrph'],
                success_url: `${appUrl}/settings?donation=success`,
                cancel_url: `${appUrl}/settings`,
                metadata: { kind: 'donation' },
            },
        },
    }, {
        headers: {
            Authorization: `Basic ${encoded}`,
            'Content-Type': 'application/json',
        },
    });
    const checkoutUrl = response.data.data.attributes.checkout_url;
    return { checkoutUrl };
});
exports.paymongoWebhook = region.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (webhookSecret) {
        const sig = req.headers['paymongo-signature'] ?? '';
        const parts = Object.fromEntries(sig.split(',').map((p) => p.split('=')));
        const timestamp = parts['t'];
        const v1 = parts['v1'] ?? '';
        const payload = `${timestamp}.${JSON.stringify(req.body)}`;
        const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
        if (expected !== v1) {
            res.status(400).send('Invalid signature');
            return;
        }
    }
    const event = req.body?.data?.attributes?.type;
    if (event === 'checkout_session.payment.paid') {
        const session = req.body?.data?.attributes?.data?.attributes ?? {};
        const amount = session.line_items?.[0]?.amount ?? session.payment_intent_data?.amount ?? null;
        await db.collection('donations').add({
            kind: session.metadata?.kind ?? 'donation',
            amount,
            paidAt: admin.firestore.Timestamp.now(),
        });
    }
    res.status(200).send('ok');
});
