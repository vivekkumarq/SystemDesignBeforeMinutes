Knowledge gets you into the conversation. How you run the conversation decides the result. Here's a practical playbook for the hour itself.

## Before the interview

- **Research the company's products.** Expect questions near their domain (a payments company asks about payments; a social app about feeds).
- **Prepare your canvas.** Know your whiteboard tool (Excalidraw, Miro, a shared doc) so you aren't fighting it.
- **Warm up.** Do one quick estimate and one 10-minute mini design aloud that morning.
- **Have a template ready in your head:** requirements → estimates → API → data → diagram → deep dives.

## The first five minutes matter most

- **Restate the problem** in your own words.
- **Ask focused questions:** users and scale, core features, latency and availability targets, consistency needs, special constraints (regions, mobile, compliance).
- **Scope out loud:** "I'll focus on posting and the feed; I'll leave out messaging and ads unless you'd like them."
- **Write requirements down** where both of you can see them.

## While designing

- **Think aloud continuously.** Silence can't be graded.
- **Start simple, then evolve.** A clear, working baseline beats a premature distributed masterpiece.
- **Justify every component** with a requirement or a number.
- **Name trade-offs** at each important decision: option A vs B, choice, cost, trigger to revisit.
- **Check in** every 10 minutes: "Is this the depth you want, or should I go deeper on X?"
- **Watch the time.** Roughly: 5–8 min requirements, 3–5 estimates, 5–8 API/data, 10–15 HLD, 15–20 deep dives, 3 wrap-up.

## Handling the interviewer

| They say… | What it usually means | Good response |
|---|---|---|
| "What happens if this component fails?" | Grading fault tolerance | Walk through detection, failover, data safety, user impact |
| "Can you go deeper here?" | This is the deep dive they want | Slow down, add detail: data structures, algorithms, numbers |
| "Why not use X instead?" | Testing your reasoning, not necessarily disagreeing | Compare honestly; switch if X is better for the stated requirements |
| "Let's say traffic is 100× higher" | Scaling deep dive | Find the new bottleneck first, then fix it |
| Silence | They're waiting to see if you drive | Propose the next step yourself |

**Hints are gifts.** If they nudge you toward something, follow it.

## When you're stuck

- **Go back to requirements and numbers.** The answer usually lies in a constraint you haven't used yet.
- **Think in data flow:** where does data come from, where does it go, who reads it?
- **Use a known pattern:** "This looks like a fan-out problem / a hot-key problem / a dual-write problem."
- **Say what you'd investigate.** "I'm not sure of Kafka's exact limit here; I'd load-test, but my estimate is…"
- **Be honest** about gaps. Bluffing is easy to spot and costs more than "I don't know, but here's how I'd reason about it".

## Common mistakes to avoid

- Drawing before clarifying.
- Name-dropping technologies without reasons.
- Over-engineering for imaginary scale.
- Ignoring failure modes.
- Defending a weak choice instead of updating it.
- Spending the whole time on the easy parts.
- Forgetting to summarise.

## Wrapping up well

In the last 3 minutes:
1. **Summarise** the design in four or five sentences.
2. **Name the biggest risks** and how you'd mitigate them.
3. **Mention what you'd add with more time:** monitoring/SLOs, multi-region, analytics, security hardening.

## Mindset

- The interviewer wants to see **how you think**, not a perfect answer. There isn't one.
- Treat it as **a design discussion with a future colleague**: collaborative, curious, honest.
- One shaky section doesn't sink an interview. Recover and keep driving.
- Afterwards, write down what went well and what you'd change; the next one gets easier.

## Behavioural crossover

Senior design rounds often include questions like "tell me about a system you designed" or "a production incident you handled". Prepare two or three stories with: the context, your design choices and trade-offs, what went wrong, how you measured success, and what you'd do differently.

> [!TIP] The one habit that helps most
> After every decision, add one sentence: "…and the trade-off is ___." It turns a description into a senior-level answer.
