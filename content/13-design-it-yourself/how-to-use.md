Reading designs builds recognition. Producing designs builds skill, and interviews test production. These labs make you design first and compare second.

## How each lab works

1. **The brief:** a product, its key features and its scale.
2. **Your turn:** set a timer for **35 minutes** and design it on a blank canvas: Excalidraw, draw.io, a whiteboard or paper all work. Talk out loud as if an interviewer were listening.
3. **Hints, in stages:** stuck? Open one hint at a time. Each one nudges without giving the whole answer.
4. **Reference design:** open it only after you've finished your own. Compare, don't copy.
5. **Self-review checklist:** score yourself honestly.

## The canvas template

Divide your canvas into regions before you start. It keeps you on the method from [A Framework for Any Design Question](#/l/01-fundamentals/interview-framework).

```text
┌───────────────────────────┬──────────────────────────┐
│ 1. REQUIREMENTS           │ 2. ESTIMATES             │
│ functional (3–5)          │ DAU, QPS avg/peak        │
│ non-functional (numbers)  │ storage, bandwidth       │
├───────────────────────────┼──────────────────────────┤
│ 3. API                    │ 4. DATA MODEL            │
│ main endpoints            │ entities + access paths  │
├───────────────────────────┴──────────────────────────┤
│ 5. HIGH-LEVEL DIAGRAM (boxes + arrows + flows)       │
├──────────────────────────────────────────────────────┤
│ 6. DEEP DIVES · TRADE-OFFS · FAILURE MODES · RISKS   │
└──────────────────────────────────────────────────────┘
```

## Drawing conventions that make diagrams readable

- **Shapes:** rectangles for services, cylinders for databases, a stacked shape or `[[ ]]` for queues/topics, a cloud for external systems, a phone/browser icon for clients.
- **Arrows:** label them with *what* flows (`POST /orders`, `OrderPlaced event`, `location ping`). Use solid arrows for synchronous calls and dashed ones for asynchronous events.
- **Number the main flow** (1, 2, 3…) so you can narrate it.
- **Colour sparingly:** one colour for the write path, another for the read path.
- **Leave room** on the right for deep-dive notes.

## Scoring yourself

After each lab, score 0–2 on each line (0 = missed, 1 = partly, 2 = solid):

| Area | What "2" looks like |
|---|---|
| Requirements | Scoped features + NFRs with numbers |
| Estimates | QPS, storage and the implication stated |
| API & data | Endpoints with idempotency/pagination; access-pattern-driven storage |
| Core flow | The main use case works end to end |
| Scale | Bottleneck identified and addressed with justification |
| Consistency | Clear where strong vs eventual, with reasons |
| Failure | Timeouts, retries, failover, degradation discussed |
| Trade-offs | At least two decisions with alternatives rejected |
| Communication | You could narrate it clearly in 5 minutes |

**14–18:** interview-ready for this kind of problem. **9–13:** good foundation; review the reference's deep dives. **Below 9:** revisit the related chapters, then redo the lab in a week without hints.

## Tips

- **Redo labs.** The second attempt a week later shows real progress.
- **Explain your diagram to someone else** (or record yourself). Gaps become obvious.
- **Vary the constraints:** after finishing, ask "what if traffic were 100× higher?" or "what if it had to work offline?".

The labs in this chapter: notification system, search autocomplete, meeting scheduler, ticket booking, cart and checkout, food delivery, and file storage with sync.
