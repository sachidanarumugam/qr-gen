# Manual test checklist

Run `npm run dev` and open the site. Check these in a desktop window and again at about 360 px wide.

## Content

- [ ] On first load the preview says "Enter valid content to see your QR code" and no field shows an error.
- [ ] URL: `example.com` becomes `https://example.com` in the hint and in the payload box. `ftp://example.com` shows no code. `hello` shows "URL needs a domain name such as example.com" after you type it.
- [ ] Text: any non-empty text produces a code. Spaces you type are kept.
- [ ] Email: `me@example.com` with subject `Hi there` and body `A & B` encodes as `mailto:me@example.com?subject=Hi%20there&body=A%20%26%20B`. Clearing the subject and body removes the `?`.
- [ ] Phone: `+1 (555) 123-4567` encodes as `tel:+15551234567`. `123` shows no code.
- [ ] Wi-Fi: SSID `Home` and password `password123` encodes as `WIFI:T:WPA;S:Home;P:password123;;`. Hidden adds `H:true`. Security "None" hides the password field and omits `P:`.
- [ ] Switching types does not erase what you already typed.
- [ ] Pasting several thousand characters shows "This content is too long for a QR code" and the rest of the page still works. Shortening the text brings the code back.

## Style, presets, download

- [ ] Size and margin update the preview. Values outside the range snap back when you leave the field. The preview may shrink to fit the screen.
- [ ] `#RGB` and `#RRGGBB` update the code. Anything else shows "Enter a color as #RGB or #RRGGBB, for example #1a73e8" and the code keeps the last valid color.
- [ ] L, M, Q, and H each change the one-line explanation.
- [ ] Each preset changes the colors, the level, and the margin. Editing one of those afterwards sets the label to Custom. Changing the size does not.
- [ ] Download PNG is disabled until the code is valid. The saved file is named `qr-<type>-<date>-<time>.png` and its pixel size matches the Size field, including on a high-density screen.

## Warnings and recent codes

- [ ] An amber note appears for contrast below 4:1, and the stronger wording appears below 2:1.
- [ ] A note appears when the foreground is lighter than the background, when the size is under 160 px, when the margin is under 4, and when the payload is over 200 characters at a size under 256. The code still downloads.
- [ ] A valid code appears in Recent about a second and a half after you stop editing. The same code is not saved twice in a row. The list says "Saved only in this browser."
- [ ] A Wi-Fi entry shows the network name and "password hidden", not the password.
- [ ] Clicking an entry restores the type, the inputs, and the style. Delete removes one entry. Clear all removes the list.
- [ ] Refresh the page. The list is still there.

## Layout and keyboard

- [ ] At 360 px wide the page does not scroll sideways. The order is Content, Preview, Style, Presets, Recent.
- [ ] At 900 px and wider, the controls are on the left and the preview stays on the right.
- [ ] Tab reaches every control, and the focused control has a blue ring. Buttons, inputs, and the preset cards are at least 44 px tall.
