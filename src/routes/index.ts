
import express from "express";
import Stripe from "stripe";
import config from "../../config";

const stripe = new Stripe(config.STRIPE_SK, {
  apiVersion: "2020-08-27",
  typescript: true
});

const router = express().router;


router.get("/", (_: express.Request, res: express.Response): void => {
  res.send("Hello SuperCharge");
});

router.post(
  "/createPaymentMethod",
  async (req: express.Request, res: express.Response): Promise<void> => {
    const {
      number,
      exp_month,
      exp_year,
      cvc
    }: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    } = req.body;

    try {
      const paymentMethod: Stripe.PaymentMethod = await stripe.paymentMethods.create({
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
    } catch (e) {
      res.send({ error: e.message });
    }
  }
);


router.post(
  "/pay",
  async (req: express.Request, res: express.Response): Promise<void> => {
    
    const {
      paymentMethodId,
      paymentIntentId,
      useStripeSdk,
      amount
    }: {
      paymentMethodId: string;
      paymentIntentId: string;
      amount: number;
      useStripeSdk: boolean;
    } = req.body;

    try {
      let intent: Stripe.PaymentIntent;
      if (paymentMethodId) {
        const params: Stripe.PaymentIntentCreateParams = {
          amount: amount, // random amount.
          confirm: true, //automatically paid, don't need to confirm later.
          confirmation_method: "manual", //if confirm if false, you need to confirm later.
          currency: "usd", // 3 letter iso code, can be added to body
          payment_method: paymentMethodId, // the id returned from create payment method
          use_stripe_sdk: useStripeSdk // if client has stripe sdk
        };
        intent = await stripe.paymentIntents.create(params);
      } else if (paymentIntentId) {
        intent = await stripe.paymentIntents.confirm(paymentIntentId);
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
    } catch (e) {
      res.send({ error: e.message });
    }
  }
);


export default router;