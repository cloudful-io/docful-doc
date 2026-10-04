# Agentic Project Template

A starter repository for projects that use role-based agents and approved project documentation to guide implementation.

## Included

- Agent definitions in `.agents/agents/` for planning, issue creation, implementation, and content work.
- Project guidance in `AGENTS.md` and `docs/development.md`.
- Reusable documentation templates in `docs/templates/`.
- GitHub issue forms in `.github/ISSUE_TEMPLATE/`.

## Start a project from this template

1. Create a repository from this template in GitHub, or copy the repository contents.
2. Replace the starter product requirements in `docs/product-requirements.md` with the project's approved requirements.
3. Fill in `docs/system-architecture.md` and `docs/package-api.md` as those decisions are made.
4. Update `docs/development.md` with the project's commands and workflow.
5. Review each agent in `.agents/agents/` and adjust its responsibilities and available tools for the target environment.
6. Create feature documents from `docs/templates/feature.md` and implementation plans from `docs/templates/implementation-plan.md`.
7. Remove sections and files that do not apply to the project.

The documents under `docs/templates/` are starting points, not requirements. Keep only the contracts the project needs, and record unresolved decisions instead of treating guesses as approved behavior.

## Enable GitHub template use

After pushing this project to GitHub, open **Settings → General → Template repository** and enable **Template repository**. Users can then create new repositories from it with **Use this template**.

## Agent workflow

1. Approve product requirements.
2. Ask the Planner agent to analyze a feature and prepare documentation plus an implementation plan.
3. Review and approve that plan.
4. Ask the Issue Creator agent to map approved implementation units to GitHub Issues.
5. Assign each Issue to the Implementer agent.

Agents must follow `AGENTS.md`, `docs/development.md`, and the assigned Issue. The plan and Issue acceptance criteria are the scope for implementation.
