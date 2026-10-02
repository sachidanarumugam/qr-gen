# Manual test checklist

Run `npm run dev` and open the site. Check these in a desktop window and again at about 360 px wide.

## Main flow

- [ ] Type `example.com`. A live preview appears under the chips and updates on every keystroke. Clearing the input removes it.
- [ ] Type `example.com`, press Generate (or Enter). The button says "Creating..." and a loader with filling squares appears over a blurred page for about 1.3 seconds.
- [ ] After the loader, a game offer appears. "No thanks, just download" opens the result modal. With "Show mini-games" off in settings, the result modal opens right after the loader.
- [ ] The result modal pops in with a drawing checkmark, "QR created!", the QR code on a white card, and confetti. The page behind is blurred and tinted blue.
- [ ] Download PNG saves `qr-url-<date>-<time>.png`. Its pixel size matches the Size setting, including on a high-density screen.
- [ ] Escape, the X, a click outside, and Create another all close the modal with a short exit animation. Focus returns to Generate, except after Create another, which clears the input and focuses it.
- [ ] While the modal is open, Tab and Shift+Tab never leave it.
- [ ] Generate on an empty input shakes the bar and shows "Enter a URL" in a black label. The label goes away once the input is valid.

## Content types

- [ ] URL: `example.com` becomes `https://example.com` in the code. `ftp://example.com` and `hello` are rejected with a message.
- [ ] Text: any non-empty text works. Spaces you type are kept.
- [ ] Email: the address is the main input. Subject and Body expand under the chips. `me@example.com` with subject `Hi there` and body `A & B` encodes as `mailto:me@example.com?subject=Hi%20there&body=A%20%26%20B`.
- [ ] Phone: `+1 (555) 123-4567` encodes as `tel:+15551234567`. `123` is rejected.
- [ ] Wi-Fi: the network name is the main input. Security, Password and Hidden network expand smoothly. "None" hides the password. SSID `Home` and password `password123` encodes as `WIFI:T:WPA;S:Home;P:password123;;`.
- [ ] Switching chips swaps the input with a short slide, and does not erase what you typed for the other types.
- [ ] Pasting several thousand characters into Text and pressing Generate ends the loader with "This content is too long for a QR code" and no modal. Shortening the text works again.

## Settings drawer

- [ ] The round button at the top right slides the drawer in. The X, Escape and a click on the dimmed area close it. Focus returns to the round button.
- [ ] Size and margin sliders and number boxes stay in sync. Values outside the range snap back when you leave the box.
- [ ] `#RGB` and `#RRGGBB` update the color. Anything else shows an error and the last valid color is kept.
- [ ] L, M, Q and H are square toggles, and each changes the one-line explanation.
- [ ] Each preset changes the colors, the level and the margin. Editing one of those afterwards sets the label to Custom. Changing the size does not.
- [ ] The small preview at the top of the drawer updates immediately when you change size, either color, error correction or margin. With no valid input it says "Enter valid content to see your QR code".
- [ ] Style changes show up in both previews, in the next modal and in the downloaded file. Open the PNG: its pixel width and height equal the Size setting. Scan it with a phone; it opens the same content you typed.
- [ ] An entry appears in Recent after each successful Generate. A Wi-Fi entry shows "password hidden". Clicking an entry restores the type, inputs and style and closes the drawer. Delete and Clear all work. The list survives a refresh.

## Warnings

- [ ] The live preview, the drawer preview and the modal show a note for contrast below 4:1 (stronger wording below 2:1), a lighter foreground than background, a size under 160 px, a margin under 4, and a payload over 200 characters at a size under 256. Download still works.

## Mini-games

- [ ] After the loader the offer shows Tic-tac-toe, Memory match, Quick tap, and "No thanks, just download".
- [ ] Tic-tac-toe: you play X. Winning shows "You won!" and then the QR modal. Losing or a draw shows "Try again" and "Skip & download". The computer takes its own wins and blocks yours, and can still be beaten.
- [ ] Memory match: 12 cards, 6 pairs. A match stays up. A mismatch flips back. The move count goes up on every pair. Matching all of them reaches the QR modal.
- [ ] Quick tap: one square is lime and moves. Eight hits before the timer ends reaches the QR modal. Letting the timer run out shows "Try again".
- [ ] Every game has Back (returns to the offer) and Skip & download (opens the QR modal). Escape, the X, and a click outside close the offer and leave the code in Recent. Download PNG still works from the QR modal.
- [ ] "Don't ask again" skips the offer on the next Generate. "Show mini-games" in the settings drawer turns the offer back on.
- [ ] At 360 px the tiles are at least 56 px and the page does not scroll sideways. With reduced motion on, Quick tap moves more slowly and the win burst does not throw confetti.

## Layout, motion, keyboard

- [ ] At 360 px, 768 px and 1440 px wide the page does not scroll sideways, with and without a live preview. The input and Generate button stack on a phone, the drawer is full width under 600 px and the modal fits the screen.
- [ ] Floating shapes are hidden under 480 px wide.
- [ ] With "reduce motion" turned on in the system settings, the marquee, shapes, badge and confetti are still, and things fade instead of bouncing.
- [ ] Every control shows a white focus ring on the blue page and a black one inside the drawer and modal. Buttons and chips are at least 44 px tall.
