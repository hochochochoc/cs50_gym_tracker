# CS50 Gym Tracker

#### Video Demo: [<YOUTUBE LINK>](https://www.youtube.com/watch?v=TKfY7J4IK1I)

#### Description:

This is a React website for keeping track of your gym progress.

I made this for myself as I never liked any of the apps there are out there and just doing it with the notes app is a bit cumbersome and doesn't let me review how I progressed easily.
The website has 3 main pages, the calendar page, from where pages for the individual days can be opened, the plans page where templates for each day of the week can be shown and modified and the history page, where graphs for each exercise can be viewed, with differences in weights and reps over time.
I also made it possible to heavily modify the exercises of any day, so you can change or add exercises, change the reps and the weight, as well as their order. It is also possible to save the changed day to the templates directly, so the user doesn't have to modify them additionally to have the new goal theshold for the next time that day comes up.

The project works with the React frontend framework, written in JavaScript and HTML, and I also used Tailwind for modifying the CSS.

Since this is meant to be used in the gym, it is mostly designed for mobile screens, but it is also accessible on desktop.

For the backend, I used firebase, where I save the exercise data for each user under their name and then the date. I also save their template data in a separate folder there and do the authentification, login, logout and signing up using the firebase integrated service.

I also used react libraries for various parts of the project, such as shadcn for the graphs of the history page and Aceternity UI for the landing page.
