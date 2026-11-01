A low-level design (LLD) or machine-coding round asks you to design classes, and often write working code, for a contained system: a parking lot, an elevator, a vending machine. It tests object-oriented modelling, clean code and extensibility rather than distributed systems.

## What interviewers evaluate

| Signal | What good looks like |
|---|---|
| **Requirement clarity** | You pin down scope and edge cases before coding |
| **Modelling** | Entities, responsibilities and relationships that mirror the domain |
| **Extensibility** | New vehicle types, pricing rules or payment methods need new classes, not edits everywhere |
| **Correctness** | Edge cases handled; invalid states impossible |
| **Concurrency** | Shared resources (spots, seats, stock) can't be double-allocated |
| **Code quality** | Readable names, small methods, no god classes, sensible use of patterns |
| **Working code** (machine coding) | Runs, with a simple driver/test showing the main flows |

## A step-by-step method

### 1. Clarify requirements (5 minutes)
- List the **actors** (customer, admin, system) and the **use cases** ("park a vehicle", "pay", "exit").
- Ask about variations: types of vehicles/spots, pricing rules, multiple floors/entrances, payments, concurrency.
- Agree on scope: "I'll do parking, unparking and fees; no reservations or UI."

### 2. Identify entities (nouns) and behaviours (verbs)
Read the requirements and underline nouns (ParkingLot, Floor, Spot, Vehicle, Ticket, Payment) and verbs (park, unpark, calculateFee, pay). Nouns usually become classes; verbs become methods on the class that owns the data needed.

### 3. Define relationships
- **Composition** (owns, lifecycle tied): a `ParkingLot` has `Floor`s.
- **Aggregation/association** (uses, independent): a `Ticket` refers to a `Vehicle`.
- **Inheritance** only for true "is-a" with shared behaviour; otherwise interfaces.

### 4. Draw the class diagram
Key classes with main fields and methods, plus interfaces for anything that varies.

### 5. Find what varies and isolate it
Fee rules, spot assignment strategy, payment method, notification channel → interfaces + strategies. That's where patterns earn their place. See [Why Design Patterns Exist](#/l/15-design-patterns/intro).

### 6. Model state explicitly
Anything with a lifecycle (ticket, order, elevator, machine) gets an enum or the State pattern, with allowed transitions.

### 7. Handle concurrency
Two entry gates allocating the same spot, two users booking the same seat: use thread-safe structures, atomic operations or locks around the critical section.

### 8. Write code (machine coding)
Start with models and interfaces, then the core service, then a small `main` or tests that exercise the main flows. Keep it compiling as you go.

### 9. Walk through extensions
"To add electric-vehicle charging spots, I add a `SpotType.EV` and a fee strategy; nothing else changes."

## Common building blocks

| Need | Typical design |
|---|---|
| Varying algorithm (fees, matching) | Strategy interface |
| Object lifecycle | Enum + transitions, or State pattern |
| Creating the right subtype | Factory |
| Notifying displays/users | Observer |
| One shared instance (the lot, the system) | Single instance managed by the caller/DI (avoid global singletons in code you want to test) |
| Many optional fields | Builder |
| Storage | Repository interfaces with in-memory implementations |

## Code-quality checklist

- [ ] Each class has one clear responsibility.
- [ ] No `switch` on type codes that would need editing for new types.
- [ ] Fields are private; objects are immutable where possible (IDs, money, value objects).
- [ ] Money is in integer minor units or `BigDecimal`, never `double`.
- [ ] Time is injectable (a `Clock`) so fee logic can be tested.
- [ ] Exceptions are specific (`SpotUnavailableException`), not generic.
- [ ] Concurrency hotspots are identified and protected.
- [ ] A driver or tests show it working.

## Common mistakes

- Jumping into code before agreeing on requirements.
- A single `Manager` class doing everything.
- Inheritance for everything (`Car extends Vehicle extends ParkingThing`).
- Ignoring concurrency when resources are shared.
- Pattern-stuffing: patterns with no variation to justify them.
- Running out of time without anything runnable.

> [!INTERVIEW] Narrate your trade-offs
> "I'm making `SpotAllocationStrategy` an interface because the problem says allocation could be nearest-to-entrance or by floor. For now there's one implementation, but swapping is a one-line change in configuration."

## The case studies in this chapter

Parking lot, library management, vending machine, tic-tac-toe, movie ticket booking, elevator system, food delivery, ride sharing, stock exchange order book and social media feed. Each lists requirements, a class diagram, key code and the extension points.
