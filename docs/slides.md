# Slide 1 - The Problem
- Early 2000s: one big codebase, frequent outages, slow releases
- Teams waited on each other, and bugs hit the whole site
- Goal: show how small independent services fix this

# Slide 2 - Architecture
- Node.js service (catalog and orders) with health and metrics endpoints
- Docker image -> Kubernetes (3 replicas) -> Prometheus -> Grafana
- Ansible prepares the runtime environment

# Slide 3 - Pipeline Flow
- Push to main -> GitHub Actions
- Job 1: install and test. Job 2: build image and push to GHCR
- (Insert pipeline diagram screenshot)

# Slide 4 - Challenges
- Ansible playbook had to be written for macOS (Homebrew, not apt)
- Monitoring stack needed more Docker memory
- ServiceMonitor needed the right release label

# Slide 5 - Lessons Learned
- Small independent releases (we shipped 2.1.0, 2.2.0 and 2.3.0 back to back)
- Rolling update and rollback make releases safe
- Dashboards turn "it feels slow" into numbers
(Insert Grafana dashboard screenshot)