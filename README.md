# Challenge: Aircall Pager Service

---

## System Requirements

| Element  | version | 
|---|---|
| [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) | 0.33.11 |
| [Node.js](https://nodejs.org/download/release/v14.0.0/)   | 14.0.0  |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)  | 6.14.4  |

_Use nvm to get and set the proper Node.js version!_

## Project Structure
Relevant places
```
.
└── challenge-aircall-pager/
    ├── .reports/
    │   └── coverage
    ├── __tests__/
    │   ├── domain/
    │   │   └── services/
    │   │       ├── escalate-incidence-service.test.ts
    │   │       ├── open-incidence-service.test.ts
    │   │       └── update-incidence-service.test.ts
    │   └── doubles.ts
    ├── src/
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── monitored-service-entity.ts
    │   │   ├── services/
    │   │   │   ├── escalate-incidence-service.ts
    │   │   │   ├── open-incidence-service.ts
    │   │   │   └── update-incidence-service.ts
    │   │   └── value-objects/
    │   │       ├── email-notification.ts
    │   │       ├── escalation-policy.ts
    │   │       └── sms-notification.ts
    │   ├── infrastructure/
    │   │   ├── escalation-policies/
    │   │   │   └── escalation-policies-port.ts
    │   │   ├── mail/
    │   │   │   └── mail-port.ts
    │   │   ├── persistence/
    │   │   │   └── persistence-port.ts
    │   │   ├── sms/
    │   │   │   └── sms-port.ts
    │   │   └── time-start/
    │   │       └── timer-start-port.ts
    │   └── presentation/
    │       ├── alerting/
    │       │   └── alerting-port.ts
    │       ├── timer-timeout/
    │       │   └── timer-timeout-port.ts
    │       └── web-console/
    │           └── web-console-port.ts
    ├── node_modules/
    │   └── ...
    ├── .gitignore
    ├── config.ts
    ├── index.js
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    └── README.md
```
Explanation
- **Domain** Service's implementation: Business logic identified as well as its entities and value objects
- **Infrastructure** refers to the secondary/driven ports
- **Presentation** refers to the primary/driver/driving ports

Actually, ports existing in the presentation are implemented by the domain services
Ports from the infrastructure layer are just the interfaces, no adapters implemented

[More info here](https://jmgarridopaz.github.io/content/hexagonalarchitecture.html)

## Run (test)

`npm test`

## Decisions

Ok, TypeScript is not my main language, despite I tried my best, there are many things I suspect they are incorrect, so feel free to roast this code 

### Functional

- Healthy/unhealthy abstraction: Assumed Pager just tracks unhealthy services (more on this at docstrings):
  - healthy: it does not exist on Pager DB
  - unhealthy: it does exist on Pager DB
- Timer has been split as a primary and a secondary port

### Non-functional

| Issue | Resolution |
|---|---|
| Domain events | An event-sourcing approach could be probably better, but the implementation would have been more complex... |
| Asynchronous/Synchronous | Synchronous, I felt that for the purposes of this exercise going async would not add more value rather than letting you know I can work with promises |
| Inversion of Control / Dependency Injection/Inversion | By hand (I have seen some promising frameworks, but I did not feel I had enough time to learn any of them |
| Other Design Patterns rather than DI | I did not find myself in an urge to include any, maybe implement the Domain Services as singletons, but its not critical for the demonstration these not being this way |
| Logging | Well, there are different ways of what to log, in case of no definition, I prefer to discuss it with the team |
| PersistenceTestDouble | Cleaner tests than using a basic mock |
| jest as Unit Test framework | Just because I am a bit more used to it |
| ts-auto-mock | Mock interfaces easily (it is really handy) |
