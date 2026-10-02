# Manual test checklist

Run `npm run dev` and open the site. Check these in a desktop window and again at about 360 px wide.

## Main flow

- [ ] Type `example.com`, press Generate (or Enter). The button says "Creating..." and a loader with filling squares appears over a blurred page for about 1.3 seconds.
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
- [ ] Style changes show up in the next modal and in the downloaded file.
- [ ] An entry appears in Recent after each successful Generate. A Wi-Fi entry shows "password hidden". Clicking an entry restores the type, inputs and style and closes the drawer. Delete and Clear all work. The list survives a refresh.

## Warnings

- [ ] The modal shows a note for contrast below 4:1 (stronger wording below 2:1), a lighter foreground than background, a size under 160 px, a margin under 4, and a payload over 200 characters at a size under 256. Download still works.

## Layout, motion, keyboard

- [ ] At 360 px wide the page does not scroll sideways, the input and Generate button stack, the drawer is full width and the modal fits the screen.
- [ ] Floating shapes are hidden under 480 px wide.
- [ ] With "reduce motion" turned on in the system settings, the marquee, shapes, badge and confetti are still, and things fade instead of bouncing.
- [ ] Every control shows a white focus ring on the blue page and a black one inside the drawer and modal. Buttons and chips are at least 44 px tall.
