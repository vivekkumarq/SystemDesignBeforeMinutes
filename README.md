# SystemDesignBeforeMinutes
n**Live:** https://systemdesignbeforeminutes.duckdns.org

A complete system design course written in plain language: fundamentals, databases, caching, CDNs, networking, API design, distributed systems, trade-offs, HLD and LLD case studies, design patterns and rapid revision.

Every lesson has diagrams, interview angles and, at the end of each chapter, Q&A and a quiz.

## Features

- 18 chapters, a sidebar course outline and per-lesson progress tracking saved in your browser
- Mermaid diagrams that follow light and dark mode
- Interactive quizzes, flashcards and collapsible interview Q&A
- Full-text search across every lesson (`Ctrl K` or `/`)
- "On this page" contents with scroll tracking, reading progress bar, prev/next with arrow keys
- Text size control, works on phones

## Run locally

No build step. Serve the folder with any static server:

```bash
python -m http.server 8741
```

Lessons are Markdown files in `content/<chapter>/<lesson>.md`; the syllabus is `js/course.js`. Run `node tools/check.js` to validate quizzes and see which lessons are still to be written.
