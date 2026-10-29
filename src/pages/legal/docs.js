/*
 * Terms, privacy and refund policy. Plain language on purpose.
 * Operator: Sangjin Ouh (sole proprietor), California. Review with a lawyer before scaling.
 */
export const CONTACT = 'hello@getwhileyouareaway.com'
export const OPERATOR = 'Sangjin Ouh'
export const EFFECTIVE = 'October 28, 2026'
export const PRICE = '$24'

export const DOCS = {
  terms: {
    title: 'Terms of Service',
    intro: `These terms are the agreement between you and ${OPERATOR}, who runs While You’re Away (“we”, “us”) from California. By buying or using the service you agree to them. If something here is unclear, write to ${CONTACT}.`,
    sections: [
      ['What the service is', [
        'While You’re Away lets you prepare letters, photos, voice notes and short videos before a goodbye, and hand the person you’re writing to (the “recipient”) a private link where those letters open over time.',
        'It includes an AI guide that helps you plan the letter box and find what to say. It does not write your letters for you, and what it suggests may be imperfect. You decide what goes in.',
      ]],
      ['Who can use it', [
        'You must be at least 18 to buy a letter box. Recipients can be any age; if you write to a child, you are responsible for what you send them.',
      ]],
      ['Price and payment', [
        `A letter box costs ${PRICE}, paid once. There is no subscription and nothing renews. Payments are processed by Stripe; we never see or store your card number.`,
        'One payment covers one letter box for one recipient, including the planning conversation, the writing companion (up to a fair-use limit of 300 messages), and hosting as described below.',
      ]],
      ['Refunds', [
        'You can get a full refund within 14 days of purchase, for any reason. The details are in our Refund Policy.',
      ]],
      ['How long your letter box stays online', [
        'We keep each letter box available to its recipient for at least one year after the day you meet again, or at least two years from purchase if you didn’t set a date, whichever is later. If we ever need to shut the service down, we will email you at least 60 days before and give you a way to download your letters, photos and voice notes.',
      ]],
      ['Your content', [
        'What you write and upload stays yours. You give us permission to store it, process it (for example, resizing photos and sending parts of the planning conversation to our AI provider to generate replies), and show it to the people who have your recipient’s link. We use it only to run the service for you.',
        'Anyone with the link can open the letter box, so share it only with your recipient. Letters stay sealed on our servers until their day; we don’t send sealed letters to the recipient’s phone early.',
        'Replies your recipient writes are shown to you.',
      ]],
      ['What you agree not to do', [
        'Don’t upload anything you don’t have the right to share, anything illegal, anything that harasses or threatens someone, or sexual content involving anyone under 18. Don’t try to break, overload or get around the security of the service.',
        'We may remove content or close a letter box that breaks these rules. If we do, we’ll tell you why when we can.',
      ]],
      ['Availability', [
        'We work to keep the service running and your letters safe, but we can’t promise it will never be interrupted, and things like signed photo links expire and refresh. Please keep your own copies of anything irreplaceable.',
      ]],
      ['Disclaimers and limits', [
        'The service is provided “as is”. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability for any claim is limited to the amount you paid for the letter box. Nothing here limits rights you have under consumer protection law that can’t be waived.',
      ]],
      ['Changes and law', [
        'We may update these terms. If a change is material, we’ll email you or show a notice on the site before it takes effect. These terms are governed by the laws of the State of California, USA.',
      ]],
      ['Contact', [`${OPERATOR}, California, USA · ${CONTACT}`]],
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    intro: 'Your letters are some of the most personal things you’ll ever write. This page explains exactly what we collect, why, and who else touches it.',
    sections: [
      ['What we collect', [
        'From you (the sender): your email address; the names, dates and answers you give while planning; your letters, photos, videos, voice notes and signature; the planning and writing-companion conversations; and your payment status from Stripe (not your card number).',
        'From your recipient: the replies they write and which letters they’ve opened, with the date. We don’t ask recipients to create an account or give their email.',
        'Technical data: our hosting provider keeps standard server logs (such as IP address, browser type and time of request) for security and troubleshooting. Your draft is also saved in your own browser’s local storage so you don’t lose work.',
      ]],
      ['How we use it', [
        'Only to run the service: to save your letter box, show it to your recipient on the right days, send you the emails you asked for (sign-in codes, evening writing questions you opted into, a reminder on the day you part), generate the AI guide’s replies, process payment, prevent abuse and fix problems.',
        'We don’t sell your information, we don’t use it for advertising, and we don’t read your letters except when you ask us to help with a problem or when we must to investigate abuse or comply with the law.',
      ]],
      ['Who else processes it', [
        'Stripe (payments) · Supabase (database, sign-in and file storage) · Vercel (hosting) · Anthropic (the AI guide; the planning and companion conversations and a short summary of your letter box are sent to generate replies) · Resend (sending email).',
        'Each processes data only to provide its part of the service to us.',
      ]],
      ['Cookies, tracking and “Do Not Track”', [
        'We don’t use advertising or analytics trackers, and we don’t let other parties collect information about your activity across other websites. We use your browser’s local storage to keep your draft and the recipient’s view working offline. Because we don’t track you across sites, we treat every visitor the same whether or not their browser sends a “Do Not Track” signal.',
      ]],
      ['How long we keep it', [
        'We keep your letter box for as long as described in our Terms (at least one year after the day you meet again). You can ask us to delete your account and everything in it at any time by writing to us; we’ll do it within 30 days. Payment records are kept by Stripe as the law requires.',
      ]],
      ['Your choices', [
        `You can see and change your letters at any time while signed in. To get a copy of your data, correct something you can’t change yourself, or delete everything, email ${CONTACT}. You can turn off the evening writing emails with the link in any of them.`,
      ]],
      ['Children', [
        'The service isn’t meant for children to buy or use on their own, and we don’t knowingly collect personal information from children under 13. Parents sometimes create letter boxes for their children; if the recipient is under 13, please know that replies they type are stored and shown to you. If you think a child has given us personal information, write to us and we’ll delete it.',
      ]],
      ['Security', [
        'Letter boxes are reached only through a long random link; sealed letters stay on our servers until their day; photos and voice notes are kept in private storage and shown through links that expire after a few hours. No system is perfectly secure, so please don’t include passwords, ID numbers or financial details in your letters.',
      ]],
      ['Changes', [
        'If we change this policy in a way that matters, we’ll email you or show a notice on the site before it takes effect. The date at the top shows the latest version.',
      ]],
      ['Contact', [`${OPERATOR}, California, USA · ${CONTACT}`]],
    ],
  },

  refunds: {
    title: 'Refund Policy',
    intro: 'Writing these letters takes a lot of you. If it isn’t right for you, you shouldn’t pay for it.',
    sections: [
      ['14 days, any reason', [
        `Within 14 days of your purchase, you can get a full refund of the ${PRICE}, for any reason. Email ${CONTACT} from the address you used at checkout (or include it), and tell us it’s a refund request. You don’t have to explain.`,
      ]],
      ['After 14 days', [
        'After 14 days we generally don’t refund, because your letter box is being kept and delivered over many months. But if something on our side stopped it from working and we can’t fix it, we’ll refund you in full, at any time.',
      ]],
      ['What happens after a refund', [
        'We’ll close the letter box and its link within a few days, and send you your letters first if you ask. The money goes back to your original card through Stripe; banks usually take 5 to 10 business days to show it.',
      ]],
      ['Talk to us first', [
        'If something went wrong, please write to us before disputing the charge with your bank. We answer every email and a refund is faster for you.',
      ]],
    ],
  },
}
