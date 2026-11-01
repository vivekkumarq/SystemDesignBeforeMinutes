Fifty low-level design concepts in one or two lines each, for the evening before a machine-coding or LLD round.

## Object-oriented foundations (1–10)

1. **Encapsulation.** Keep fields private; expose behaviour, not data.
2. **Abstraction.** Depend on what something does (interface), not how.
3. **Inheritance.** Use only for true "is-a" with shared behaviour; it couples tightly.
4. **Polymorphism.** One interface, many implementations; replaces type switches.
5. **Composition over inheritance.** Build behaviour by combining objects.
6. **Interfaces vs abstract classes.** Interface for capability/contract; abstract class for shared state/skeleton.
7. **Cohesion.** A class's members belong together; high cohesion is good.
8. **Coupling.** How much classes depend on each other; keep it low.
9. **Immutability.** Final fields, no setters; thread-safe and easier to reason about.
10. **Value objects.** Money, Email, Coordinates as small immutable types instead of primitives.

## SOLID (11–15)

11. **SRP.** One reason to change per class.
12. **OCP.** Extend by adding classes, not editing working code.
13. **LSP.** Subtypes must honour the parent's contract (no surprise exceptions).
14. **ISP.** Small role interfaces; no forced empty methods.
15. **DIP.** Depend on abstractions; inject implementations. See [SOLID](#/l/15-design-patterns/solid).

## Creational patterns (16–20)

16. **Singleton.** One instance; prefer holder idiom or enum; DCL needs `volatile`; prefer DI in practice.
17. **Simple factory.** Centralise `new` logic behind a method/registry.
18. **Factory method.** Subclass decides which product to create.
19. **Abstract factory.** Creates families of matching objects.
20. **Builder.** Readable construction of objects with many optional fields; validate in `build()`.

## Structural patterns (21–27)

21. **Adapter.** Wrap an incompatible API to fit your interface; translate units and errors.
22. **Bridge.** Split two independent dimensions: N + M classes instead of N × M.
23. **Composite.** Trees where leaves and containers share an interface.
24. **Decorator.** Stackable wrappers adding behaviour with the same interface (Java I/O).
25. **Facade.** One simple entry point to a complex subsystem.
26. **Proxy.** Same interface, controls access: lazy, caching, security, remote (Spring AOP).
27. **Flyweight.** Share immutable intrinsic state across many objects.

## Behavioural patterns (28–35)

28. **Strategy.** Interchangeable algorithms chosen at runtime (pricing, sorting).
29. **Observer.** Notify subscribers of changes without coupling (events).
30. **State.** One class per state; behaviour changes as state changes.
31. **Template method.** Final skeleton in base class; subclasses fill steps.
32. **Command.** Encapsulate a request as an object (undo/redo, queues).
33. **Chain of responsibility.** Pass a request along handlers until one handles it (filters, approvals).
34. **Iterator.** Traverse a collection without exposing its structure.
35. **Mediator.** Objects communicate through a central coordinator instead of each other.

## Concurrency in LLD (36–42)

36. **Race condition.** Outcome depends on timing; check-then-act is the classic bug.
37. **Atomic operations.** `AtomicInteger`, `compareAndSet` for lock-free claims (spots, seats, drivers).
38. **Locks.** `synchronized`/`ReentrantLock`; keep critical sections small; lock per resource, not globally.
39. **Concurrent collections.** `ConcurrentHashMap`, `CopyOnWriteArrayList` (read-heavy listener lists), blocking queues.
40. **Deadlock.** Avoid by consistent lock ordering and timeouts.
41. **Thread confinement / single writer.** One thread owns a structure (order book per symbol).
42. **Producer–consumer.** Blocking queue between request handlers and workers.

## Modelling practice (43–50)

43. **Nouns → classes, verbs → methods** on the class owning the data.
44. **State machines** for lifecycles (orders, tickets, machines) with validated transitions.
45. **Strategies at variation points** (fees, matching, notifications, payments).
46. **Repositories** behind interfaces with in-memory implementations for tests.
47. **Money as integers** (paise) or `BigDecimal`, never `double`.
48. **Inject `Clock`** for time-dependent logic (fees, expiry).
49. **Specific exceptions** (`SeatUnavailableException`) over generic ones.
50. **Driver/tests** that demonstrate the main flows: the "it runs" signal in machine coding. See [How to Approach an LLD Interview](#/l/16-lld-case-studies/approach).

> [!TIP] Quick self-test
> For each pattern, name one real example (JDK, Spring or a case study) and one situation where you would **not** use it.
