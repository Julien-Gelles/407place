<h1 align="center">
407PLACE
</h1>

<p align="center">
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</a>
<a href="https://expressjs.com">
<img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge">
</a>
<a href="https://www.mongodb.com/">
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white">
</a>
</p>

<p align="center">
<a href="#overview">Overview</a> • <a href="#how-to-use">How To Use</a> • <a href="#colors">Colors</a> • <a href="#features">Features</a> • <a href="#author">Author</a><br>
</p>

<p align="center">
<img src="img/logo.png">
</p>

---

## Overview 

This project is a real-time community canvas where you can only draw pixels of colors, creating pixel art. It's my own version of the subreddit r/place.<br>
It uses Socket.IO to manage real-time communication between the server and clients and MongoDB to store canvas datas.

Freely hosted on **[Glitch](https://glitch.com/)** and available at the web address: **https://407place.glitch.me**


## How To Use

### Express.js
Make sure you have **express.js** installed. If not you can install it with :

```bash
$ npm install express
```

### MongoDB

If you wish to execute the code independently, you'll need to establish your own MongoDB with the specified configuration:

- Create a database named **`canvas`**.
- Set up a collection named **`tiles`**.
- Include an entry with a key named **`_id`** set to **`1`** and a corresponding value named **`t`**.

Finally, make sure to set up the MongoDB connection string in a **.env** file :

```bash
DB_STRING = 'mongodb+srv://username:password@cluster0.nvr1sil.mongodb.net/?retryWrites=true&w=majority' #Write here your own MongoDB URI connection string
```


Alternatively, feel free to modify the code below in `server.js` , as you prefer :

<img src="img/mongoSetup.png">

### Run

Then you can start the app with :

```bash
$ npm start
```


## Colors

Users can choose from a variety of colors to draw on the canvas, which are the same as the default colors in the [Pixeliser project](https://github.com/Julien-Gelles/Pixeliser).

<img src="img/colors.png">

## Features

- A loading screen that is displayed until the canvas data is loaded from the database.
- Zooming and panning functionality for the canvas.
- Simultaneous draw and broadcast changes in real-time.
- An easter egg 

## Author

- [Gelles Julien](https://www.github.com/julien-gelles)


