# Christmas Wishlist

A small, static Christmas wishlist for Wanda, made with plain HTML, CSS, vanilla JavaScript and JSON. There are no accounts, reservations, databases, build tools or backend services. The sample links open shopping searches so you can replace them with a specific product page when you find the right item.

## Edit the wishes

Open `gifts.json` on GitHub and edit the details. It contains the page title, child’s name, introduction and an array of gifts. Each gift can have:

- `id`: a unique number
- `name`: product name
- `image`: path to an image in `images/`
- `url`: product or shop URL (must use `https://` or `http://`)
- `price`: estimated price in PLN
- `category`: one of the categories listed below
- `shortDescription`: one-line card description
- `description`: longer text shown in the details window
- `variant`: optional size, color or model information

Supported categories: `Toys & Games`, `Books`, `Creative & Educational`, `Outdoor & Active Play`, `Furniture & Room Decor`, `Clothes & Accessories`, and `Other Wishes`. Remove a gift object to remove the item. Keep valid JSON syntax: use double quotes around keys and text, commas between objects, and no comma after the last item in an array. The page automatically limits the category filter to categories used by gifts.

## Add or change images

1. Prepare a compressed `.jpg`, `.png`, `.webp` or `.svg` product image. Around 800 × 700 px and a few hundred KB or less works well.
2. In GitHub, open `images/`, choose **Add file → Upload files**, and commit the image.
3. Set that gift’s `image` value to a relative path, for example `images/wooden-train.jpg`. Keep filenames simple and match capitalization exactly.

This repository includes lightweight decorative SVG sample illustrations. Replace them with real product photos you have permission to use. If an image cannot load, the page displays a local placeholder.

## Publish on GitHub Pages

1. Push or commit the project files to the repository’s `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and the `/ (root)` folder, then save.
4. Wait for the Pages deployment. The site should be available at `https://wanda-prezenty.github.io/`.

The site uses relative asset and JSON paths, so the files also work under a repository subpath. Since the wishlist fetches `gifts.json`, view it through a web server such as GitHub Pages; opening `index.html` directly as a `file://` URL may prevent the browser from loading JSON. Google Fonts are an optional visual enhancement; system serif and sans-serif fonts are used as fallbacks.

## Sharing and privacy

Use **Share this list** to open the browser’s native share sheet where supported, or use **Copy wishlist link**. The store links open a new tab. This is an inspiration list only: there is no reservation, account, checkout or purchase feature.
