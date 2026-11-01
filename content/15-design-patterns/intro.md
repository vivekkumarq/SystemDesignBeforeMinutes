A design pattern is a named, reusable solution to a problem that keeps coming up in object-oriented design. Patterns are not libraries you install. They are shapes of code that experienced developers recognise, and the names let a team say "use a strategy here" instead of explaining the structure from scratch.

## Why they matter in interviews

- **LLD / machine-coding rounds** ("design a parking lot", "design a vending machine") reward code that is easy to extend. Patterns are the standard tools for that.
- **Shared vocabulary:** naming the pattern shows you know the trade-offs that come with it.
- **Spotting them in frameworks:** Spring, the JDK and logging libraries are full of patterns; recognising them helps you use those frameworks well.

## The three families

| Family | Question it answers | Patterns in this course |
|---|---|---|
| **Creational** | How are objects created? | Singleton, Factory (simple, method, abstract), Builder, Prototype |
| **Structural** | How are objects composed into larger structures? | Adapter, Bridge, Composite, Decorator, Flyweight, Facade, Proxy |
| **Behavioural** | How do objects communicate and share responsibility? | Strategy, Observer, Template Method, State |

## Principles underneath every pattern

Patterns are applications of a few deeper ideas. Learn these and the patterns become obvious:

1. **Program to an interface, not an implementation.** Depend on `PaymentGateway`, not `RazorpayGateway`.
2. **Favour composition over inheritance.** Build behaviour by combining objects instead of deep class hierarchies.
3. **Encapsulate what varies.** Find the part that changes (pricing rule, notification channel) and isolate it behind an abstraction.
4. **Open/closed:** add new behaviour by adding code, not editing working code.
5. **Loose coupling:** objects know as little about each other as possible.

These are formalised in [SOLID Principles in Depth](#/l/15-design-patterns/solid).

## How to use patterns well

- **Start from the problem, not the pattern.** "Pricing rules change per festival" → strategy. Not "I want to use strategy somewhere".
- **Don't over-engineer.** A factory for a class with one implementation, or a singleton holding global state for convenience, makes code worse. Add a pattern when a second variation actually appears, or when the interviewer's requirements clearly call for extension.
- **Modern Java changes some patterns:** lambdas make Strategy and Command lightweight; enums make thread-safe singletons trivial; records reduce Builder boilerplate for simple data.

## Quick map: problem → pattern

| You need to… | Consider |
|---|---|
| Ensure one shared instance (config, registry) | Singleton (or just dependency injection) |
| Create objects without hard-coding concrete classes | Factory Method / Abstract Factory |
| Construct complex objects step by step, with many optional fields | Builder |
| Copy a configured object cheaply | Prototype |
| Make an incompatible interface fit | Adapter |
| Vary two dimensions independently (shape × renderer) | Bridge |
| Treat a tree of parts and wholes uniformly | Composite |
| Add responsibilities at runtime without subclass explosion | Decorator |
| Share common state among huge numbers of objects | Flyweight |
| Give a simple front to a complex subsystem | Facade |
| Control access (lazy load, cache, security, remote) | Proxy |
| Swap algorithms at runtime | Strategy |
| Notify many objects when something changes | Observer |
| Fix an algorithm's skeleton but let steps vary | Template Method |
| Change behaviour when internal state changes | State |

> [!INTERVIEW] How to mention a pattern
> "Fare calculation varies by vehicle type and changes often, so I'll put it behind a `PricingStrategy` interface and inject the right strategy. Adding a new vehicle type means adding a class, not editing the trip service." That's the problem, the pattern and the benefit in one sentence.

## Key takeaways

- Patterns are named solutions to recurring design problems: creational, structural, behavioural.
- They're built on interfaces, composition, encapsulating variation and open/closed.
- Use them when the problem calls for them; avoid speculative abstraction.
- In interviews, explain the problem the pattern solves, not just its name.
