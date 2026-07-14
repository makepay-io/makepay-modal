# MakePay Modal

A small, domain-neutral browser embed for MakePay payment links and donations. The checkout host is always configured explicitly; it is never inferred from the script URL.

```html
<script
  src="https://unpkg.com/@makecrypto/makepay-modal@latest/dist/makepay.min.js"
  data-api-url-prefix="https://your-checkout-host.example"
></script>
<button data-makepay-payment-link="PAYMENT_UID">Pay</button>
```

No initialization call is required when `data-api-url-prefix` is present. Advanced integrations can also call `makepay.init`, `makepay.showPayment`, `makepay.showDonation`, `makepay.hideFrame`, or `makepay.setApiUrlPrefix`.

## Payment button

Create a payment link, copy its UID, and place it in `data-makepay-payment-link`:

```html
<button type="button" data-makepay-payment-link="PAYMENT_UID">
  Pay with crypto
</button>
```

Use `data-makepay-view-type="minimal"` for compact checkout. The default is the full checkout.

## Donation button

```html
<button type="button" data-makepay-donation-slug="DONATION_SLUG">
  Donate with crypto
</button>
```

## JavaScript API

```js
makepay.showPayment("PAYMENT_UID", {
  viewType: "minimal",
  onEvent(event) {
    if (event.type === "makepay.payment.status") {
      console.log(event.payload);
    }
  },
});
```

Available methods include `showPayment`, `showDonation`, `showFrame`, `hideFrame`, `init`, `configure`, and `setApiUrlPrefix`.

## Security model

The package contains no default checkout domain. It accepts lifecycle messages only from the exact origin configured through `data-api-url-prefix` or the programmatic API. The `@latest` URL follows the npm `latest` tag so merchants receive new modal releases without changing their embed code.
