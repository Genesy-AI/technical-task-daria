# POTENTIAL IMPROVEMENTS LIST

- add agents/claude rules/instructions relevant to this project
- add CI/CD pipeline, previous bug with pnpm install and pnpm build only surfaced at local development
- add frontend/.env file to gitignore, potential security issue, rename committed .env to .env.sample
- add monorepo tooling, switching between packages is time-consuming
- add proper internationalization, current plural rules are very fragile and hardcoded
- extract text strings into a separate file(s)
- extract common tailwind classes into components to create a simple design system, currently view is mixed with logic
- measure test coverage and add more unit tests for the most important scenarios
- extract svgs into separate files and lazy load them
- split BE into different controllers, right now we're adding everything into one file
- add middleware for handling rate limits on APIs
- add validation on FE, e.g. zod library
- review that BE validation matches FE

____

copy of my notes from the muted screen recording:

hello, unfortunately i have people visiting from abroad and it's never a good time to record a voiceover. so it's a mute video.

1) fixing frontend build command first because it would bring down the pipeline blocking everyone

2) i added allowBuilds because otherwise pnpm install wasn't working for me

3) i'll fix a bug first, important to keep prod stable. the email one sounds more serious

4) also i used agentic-skills set to guide claude more easily

5) i should have run it in plan mode first for those tasks, shouldn't have trusted its suggestion to use debugging skill right away

6) i forgot about the PR, should have passed the time reviewing that instead

7) I have effectively 0 context into the feature. fml

8) i know claude can post a review from my account but it's ai slop prose and wastes everyone's time, i'd rather parse its review myself

9) i only managed to fix one bug and review a teammate's PR in this one hour. I could have possibly made progress on another feature if I were more familiar with the project. Thank you for the task.