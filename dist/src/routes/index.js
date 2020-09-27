"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const stripe_1 = require("stripe");
const config_1 = require("../../config");
const stripe = new stripe_1.default(config_1.default.STRIPE_SK, {
    apiVersion: "2020-08-27",
    typescript: true
});
const router = express();
router.get("/", (_, res) => {
    res.send("Hello SuperCharge");
});
router.post("/createPaymentMethod", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { number, exp_month, exp_year, cvc } = req.body;
    try {
        const paymentMethod = yield stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: number,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: cvc,
            },
        });
        if (paymentMethod) { // if payment method exists, else it will already throw error 
            res.send({ last4: paymentMethod.card.last4, id: paymentMethod.id });
        }
    }
    catch (e) {
        res.send({ error: e.message });
    }
}));
router.post("/pay", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentMethodId, paymentIntentId, useStripeSdk, amount } = req.body;
    try {
        let intent;
        if (paymentMethodId) {
            const params = {
                amount: amount,
                confirm: true,
                confirmation_method: "manual",
                currency: "usd",
                payment_method: paymentMethodId,
                use_stripe_sdk: useStripeSdk // if client has stripe sdk
            };
            intent = yield stripe.paymentIntents.create(params);
        }
        else if (paymentIntentId) {
            intent = yield stripe.paymentIntents.confirm(paymentIntentId);
        }
        switch (intent.status) {
            case "requires_action":
                res.send({
                    clientSecret: intent.client_secret,
                    requiresAction: true
                });
            case "requires_payment_method":
                res.send({
                    error: "Your card was denied, please provide a new payment method"
                });
            case "succeeded":
                res.send({ clientSecret: intent.client_secret });
        }
    }
    catch (e) {
        res.send({ error: e.message });
    }
}));
exports.default = router;
