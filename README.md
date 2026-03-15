# retro-media-player

**Update March 15th, 2026: Since November 2025, this project has been in limbo due to the recent changes to Spotify Web API which disables lot of the functionality this app was intended to do. While I evaluating using other APIs such YouTube or Apple Music API, I am decided to create a new similar project in native C++, based on a codebase from 2013-2014, which I now thanks to Claude Code are able to develop into a full fledged retro styled desktop media player with modular extensibility,  media service based archicture for implemening multiple sources of music discovery, playback and sharing. I will provide more info about the new, non HTML5 native C++ UI based replacement of retro-media-player in the coming week, with plans for an alpha version Q2 2026. Thanks for bearing in mind**

**Update November, 28th 2025: Due to the new restrictions imposed on the Spotify API in winter 2025-2026, we are working on switching to another music source, as the current build is now broken due to the API changes**

![screencapture-oldify-buddhalow-2021-06-26-15_56_13](https://user-images.githubusercontent.com/5108695/123515294-196e5900-d697-11eb-9950-f61d0ff489b9.png)

An open source music streaming front-end for modern streaming services that can resemble the look and feel of the 2000s versons music players (WMP9/10/11, Spotify v < 0.8).
It aims to allow you to be nostalgic and enjoy the old days of 2000 music players and combine with music streaming of 2010-2020s.
The front end is relying solely on web components and client side support for imports, no bundling or similar.

It is currently work in progress, pre alpha state.

The project started as an An OldOS spinoff for Spotify.

An open source Spotify web client that resembles what Spotify was in 2009 based on my open source HTML5-frontend 'Bungalow' frame that is very extensible. It is based on
HTML5 web components and is split in four distinct parts:

This software is for nostalgic only and is a spin off of the OldOS-project (<https://github.com/zzanehip/The-OldOS-Project>) That resembles the old days of <= iOS 6.x.

* Plugins: Plugins can hook into various parts of the app (and other apps too).
* Services: Back-end service in Node, discovered as node modules in service folder.
* Themes: Themes can be installed into the app into the  client/themes folder which then can be discovered by the app

The goal is to create a framework like WordPress but for pure front-end work.

Work in progress, but as open source development doesn't pay my bills, I would appriciate donations using the 'Sponsor' button
