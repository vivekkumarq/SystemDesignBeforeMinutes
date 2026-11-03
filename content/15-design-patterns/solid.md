SOLID is five principles for object-oriented code that is easy to change. Each one guards against a specific kind of pain. Below, each comes with a violation, the fix and how to spot it.

## S: Single Responsibility Principle

> A class should have one reason to change.

**Violation**

```java
class InvoiceService {
    Invoice create(Order o) { /* business rules */ }
    void saveToDatabase(Invoice i) { /* SQL */ }
    byte[] renderPdf(Invoice i) { /* layout */ }
    void email(Invoice i, String to) { /* SMTP */ }
}
```

Four reasons to change: tax rules, schema, PDF layout, email provider. A change to the PDF layout risks breaking tax calculation.

**Fix:** split by responsibility: `InvoiceCalculator`, `InvoiceRepository`, `InvoicePdfRenderer`, `InvoiceMailer`, coordinated by a thin service.

**Smell:** class names with "And"/"Manager"/"Util", or methods that touch unrelated dependencies.

> [!REAL] The Swiss army knife problem
> A Swiss army knife is handy, but if the scissors break you send the whole knife for repair. A class that does billing, emailing and PDF generation breaks for three different reasons.

## O: Open/Closed Principle

> Open for extension, closed for modification.

**Violation**

```java
double discount(Customer c, double amount) {
    if (c.type() == REGULAR) return 0;
    if (c.type() == PREMIUM) return amount * 0.10;
    if (c.type() == EMPLOYEE) return amount * 0.30;   // every new type edits this method
    return 0;
}
```

**Fix:** polymorphism / strategy:

```java
interface DiscountPolicy { double discount(double amount); }
class PremiumDiscount implements DiscountPolicy { public double discount(double a) { return a * 0.10; } }
class EmployeeDiscount implements DiscountPolicy { public double discount(double a) { return a * 0.30; } }
// New customer type = new class; existing code untouched.
```

**Smell:** growing `if/else` or `switch` on a type field in several places.

> [!REAL] Phone cases and plug-in chargers
> You add a new charger by plugging it into the socket; you don't rewire the wall. New payment methods should plug in as new classes, not as new `if` branches in old code.

## L: Liskov Substitution Principle

> Subtypes must be usable anywhere their base type is expected, without surprises.

**Violation (classic):** `Square extends Rectangle`. Code that sets width 5 and height 10 expects area 50; a `Square` silently makes it 100. Another: a `ReadOnlyList` that extends `List` and throws on `add()`.

**Fix:** don't inherit when the subtype can't honour the parent's contract. Model `Shape` with `area()`, and make `Square` and `Rectangle` separate implementations; or split interfaces (`ReadableList` vs `MutableList`).

**Smell:** overrides that throw `UnsupportedOperationException`, or callers checking `instanceof` before using a base type.

> [!REAL] A toy duck that needs batteries
> If it looks like a duck but needs batteries, it's not a drop-in duck. Any subclass must work wherever the parent is expected, with no surprises.

## I: Interface Segregation Principle

> Clients shouldn't depend on methods they don't use.

**Violation**

```java
interface Worker { void work(); void eat(); void attendMeeting(); }
class Robot implements Worker {
    public void work() { }
    public void eat() { throw new UnsupportedOperationException(); }   // forced to implement
    public void attendMeeting() { throw new UnsupportedOperationException(); }
}
```

**Fix:** small, role-based interfaces: `Workable`, `Eater`, `MeetingAttendee`. Classes implement only what they support.

**Smell:** "fat" interfaces with many unrelated methods; empty or throwing implementations.

> [!REAL] The TV remote with 60 buttons
> Most people use five buttons. Give each client a small remote with only the buttons it needs, not one giant interface.

## D: Dependency Inversion Principle

> High-level modules shouldn't depend on low-level modules; both should depend on abstractions.

**Violation**

```java
class OrderService {
    private final MySqlOrderRepository repo = new MySqlOrderRepository();   // hard-wired
    private final RazorpayClient payments = new RazorpayClient();
}
```

Business logic is welded to MySQL and one payment provider, so it's hard to test and hard to change.

**Fix:** depend on interfaces and inject implementations:

```java
class OrderService {
    private final OrderRepository repo;
    private final PaymentGateway payments;
    OrderService(OrderRepository repo, PaymentGateway payments) {   // constructor injection
        this.repo = repo; this.payments = payments;
    }
}
```

Spring's dependency injection is DIP in practice; tests pass fakes instead of real databases.

**Smell:** `new` of infrastructure classes inside business logic; static calls to external systems.

> [!REAL] The standard power socket
> Your laptop depends on "a standard socket", not on a specific power plant. Code should depend on an interface (`PaymentGateway`), not on a concrete class (`RazorpayClient`).

## Summary

| Principle | Protects against | Typical tool |
|---|---|---|
| SRP | Unrelated changes colliding | Split classes by reason to change |
| OCP | Editing working code for every new case | Polymorphism, strategy, plugins |
| LSP | Subclasses breaking callers | Honour contracts; prefer composition |
| ISP | Forced, meaningless implementations | Small role interfaces |
| DIP | Business logic tied to infrastructure | Interfaces + dependency injection |

> [!WARNING] Principles, not laws
> Applied blindly, SOLID produces dozens of one-method interfaces and indirection everywhere. Apply them where change is likely or testing demands it, and keep simple things simple.

> [!INTERVIEW] Tie each principle to your design
> In an LLD round, mention SOLID through your choices: "`ParkingLot` doesn't compute fees, `FeeStrategy` does (SRP, OCP); `ParkingService` depends on a `SpotRepository` interface so I can test with an in-memory version (DIP)."

## Key takeaways

- SRP: one reason to change. OCP: extend without editing. LSP: subtypes keep promises. ISP: small interfaces. DIP: depend on abstractions, inject details.
- Each principle has a recognisable smell; learn to spot them.
- Use them pragmatically, where change and testing make them pay off.
