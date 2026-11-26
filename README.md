# MindTest

Next.js and React app with three original quizzes. Attempts and payment confirmations are stored in Neon. A downloadable PNG certificate is rendered in the browser after the result is released.

## Local development

Install dependencies with `npm ci`, copy `.env.example` to `.env.local`, and start `npm run dev`. Apply `db/schema.sql` to the Neon database used by `DATABASE_URL` if the table does not already exist.

## WayForPay

Set `APP_URL` to the public HTTPS origin. Set `WAYFORPAY_MERCHANT_ACCOUNT` and `WAYFORPAY_MERCHANT_SECRET` using the hosting provider's secret settings. Enable cards, Apple Pay and Google Pay in the WayForPay merchant dashboard and confirm that the store accepts a USD 1.00 order and its minimum amount. WayForPay may convert the charge to UAH. The provider needs anonymous access to the HTTPS `/api/payment` endpoint. The return URL alone does not unlock the result.

The IQ score is quiz accuracy, and Mental Age is a playful profile. Neither is a standardized assessment.

## Search indexing

Set `GOOGLE_SITE_VERIFICATION` in the Vercel production environment to the token from Google Search Console's HTML tag verification method. Use the token alone. After deployment, submit `https://mind-test-sigma.vercel.app/sitemap.xml` in Search Console. The sitemap uses the production origin and includes the homepage, three quizzes, and three legal pages.
