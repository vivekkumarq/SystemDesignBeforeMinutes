**Intent:** ensure a class has exactly **one instance** and provide a global point of access to it.

**Family:** creational.

## When it's genuinely useful

Some things should exist once per process: a configuration registry, a connection pool, a metrics registry, an in-memory cache, a hardware interface. Creating several would waste resources or cause conflicting state.

## Implementations in Java (from worst to best)

### 1. Eager initialisation

```java
public final class AppConfig {
    private static final AppConfig INSTANCE = new AppConfig();
    private AppConfig() { /* load config */ }
    public static AppConfig getInstance() { return INSTANCE; }
}
```

Thread-safe (class loading is thread-safe), simple. Created even if never used, which is fine for most cases.

### 2. Lazy, not thread-safe (don't do this)

```java
public static AppConfig getInstance() {
    if (instance == null) instance = new AppConfig();   // two threads can both create one
    return instance;
}
```

### 3. Synchronised method

```java
public static synchronized AppConfig getInstance() { ... }
```

Correct but every call pays for a lock, even after creation.

### 4. Double-checked locking

```java
public final class AppConfig {
    private static volatile AppConfig instance;    // volatile is essential
    private AppConfig() { }
    public static AppConfig getInstance() {
        AppConfig local = instance;
        if (local == null) {
            synchronized (AppConfig.class) {
                local = instance;
                if (local == null) instance = local = new AppConfig();
            }
        }
        return local;
    }
}
```

Lazy and fast after creation. Without `volatile`, another thread could see a partially constructed object due to instruction reordering. A classic interview probe.

### 5. Initialisation-on-demand holder (recommended lazy version)

```java
public final class AppConfig {
    private AppConfig() { }
    private static class Holder { static final AppConfig INSTANCE = new AppConfig(); }
    public static AppConfig getInstance() { return Holder.INSTANCE; }
}
```

Lazy (the holder class loads on first call), thread-safe via class loading, no locks or `volatile`.

### 6. Enum singleton (simplest robust version)

```java
public enum IdGenerator {
    INSTANCE;
    private final java.util.concurrent.atomic.AtomicLong next = new java.util.concurrent.atomic.AtomicLong();
    public long nextId() { return next.incrementAndGet(); }
}
// IdGenerator.INSTANCE.nextId();
```

Thread-safe, and immune to the two ways other singletons break: **reflection** (calling the private constructor) and **serialisation** (deserialising creates a new instance unless you add `readResolve`).

## Ways a singleton breaks

| Threat | Defence |
|---|---|
| Multiple threads on first access | Eager, holder idiom, DCL with `volatile`, or enum |
| Reflection calling the private constructor | Throw if instance already exists, or use enum |
| Serialisation creating a copy | `readResolve()` returning the instance, or enum |
| Cloning | Don't implement `Cloneable` (or throw) |
| Multiple class loaders | One instance per class loader. Beware in app servers |

## Why singletons are often a smell

- **Hidden global state:** any code can reach it, so dependencies are invisible.
- **Hard to test:** you can't easily swap in a fake; tests leak state into each other.
- **Tight coupling** to the concrete class.

**Modern alternative:** let a dependency-injection container manage a single instance (Spring beans are singleton-scoped by default) and inject it through constructors. You get "one instance" without global access.

## Where you've seen it

- `Runtime.getRuntime()` in the JDK.
- Spring's default bean scope (one per container, not a classic singleton class).
- Logger factories, metric registries.

> [!INTERVIEW] What they're really asking
> "Write a thread-safe singleton" tests whether you know about `volatile` in double-checked locking, the holder idiom, and enum singletons protecting against reflection and serialisation. Then mention that in real applications you'd usually let the DI container manage the single instance.

## Key takeaways

- One instance + global access; useful for genuinely process-wide resources.
- Prefer the holder idiom or an enum; if using DCL, `volatile` is mandatory.
- Guard against reflection, serialisation and cloning, or use an enum.
- Prefer DI-managed single instances over global singletons for testability.
