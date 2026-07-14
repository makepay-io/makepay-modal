# MakePay Modal

A small, domain-neutral browser embed for MakePay payment links and donations. The checkout host is always configured explicitly; it is never inferred from the script URL.

```html
<script
  src="https://unpkg.com/@makecrypto/makepay-modal@1.1.0/dist/makepay.min.js"
  data-api-url-prefix="https://your-checkout-host.example"
></script>
<button data-makepay-payment-link="PAYMENT_UID">Pay</button>
```

No initialization call is required when `data-api-url-prefix` is present. Advanced integrations can also call `makepay.init`, `makepay.showPayment`, `makepay.showDonation`, `makepay.hideFrame`, or `makepay.setApiUrlPrefix`.
