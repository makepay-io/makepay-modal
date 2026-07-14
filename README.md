# MakePay Modal

A small, domain-neutral browser embed for MakePay payment links and donations. The checkout host is always configured explicitly; it is never inferred from the script URL.

```html
<script src="https://unpkg.com/@makecrypto/makepay-modal@1.0.0/dist/makepay.min.js"></script>
<script>
  makepay.init({ apiUrlPrefix: "https://your-checkout-host.example" });
</script>
<button data-makepay-payment-link="PAYMENT_UID">Pay</button>
```

You can also call `makepay.showPayment(uid)`, `makepay.showDonation(slug)`, `makepay.hideFrame()`, or `makepay.setApiUrlPrefix(url)`.
