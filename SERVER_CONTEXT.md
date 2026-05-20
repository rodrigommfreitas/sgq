# PAGSQ9001 Server — Complete Analysis

## 1. Full Directory Structure

```
server/
  PAGSQ9001.iml
  .idea/
  core-service/
    pom.xml
    .mvn/
    src/main/java/com/rodrigommfreitas/coreservice/
      CoreServiceApplication.java
      auth/
        AuthController.java, AuthService.java, JwtService.java
        RefreshToken.java, RefreshTokenService.java, RefreshTokenRepository.java, RefreshTokenCleanupJob.java
        dto/ (AuthResult, LoginRequest, LoginResponse)
        exception/ (InvalidCredentialsException, InvalidRefreshTokenException)
        util/ (CookieUtil)
      awareness/
        Awareness.java, AwarenessYear.java
        AwarenessController.java, AwarenessService.java
        AwarenessRepository.java, AwarenessYearRepository.java
        dto/ (AwarenessResponse, AwarenessYearDetail, UpdateAwarenessRequest, UpdateDocumentYearsRequest)
      change/
        Change.java, ChangeStatus.java
        ChangeController.java, ChangeService.java, ChangeRepository.java
        dto/ (ChangeRequest, ChangeResponse)
      communication/
        Communication.java, CommunicationItem.java, CommunicationType.java, CommunicationYear.java
        CommunicationController.java, CommunicationService.java
        CommunicationRepository.java, CommunicationItemRepository.java, CommunicationYearRepository.java
        dto/ (various)
      config/
        SecurityConfig.java, JwtConfig.java, JacksonConfig.java
        seed/ (DataInitializer, UserSeeder, ScopeSeeder, SwotAnalysisSeeder, etc.)
      document/
        Document.java, DocumentVersion.java, DocumentStatus.java, DocumentType.java
        DocumentController.java, DocumentService.java, DocumentVersionService.java
        DocumentRepository.java, DocumentVersionRepository.java
        dto/ (DocumentResponse, DocumentVersionResponse, DocumentWithVersionsResponse, UploadDocumentRequest)
      exception/
        GlobalExceptionHandler.java
      indicator/
        Indicator.java, IndicatorYear.java, IndicatorFrequency.java, IndicatorValueType.java
        IndicatorController.java, IndicatorService.java
        IndicatorRepository.java, IndicatorYearRepository.java
        dto/ (various)
      interestedparty/
        InterestedParty.java, InterestedPartyType.java, InterestedPartyYear.java
        InterestedPartyController.java, InterestedPartyService.java, InterestedPartyYearService.java
        InterestedPartyRepository.java, InterestedPartyYearRepository.java
        dto/ (various)
      leadershipcommitment/
        LeadershipCommitment.java, LeadershipCommitmentYear.java
        LeadershipCommitmentController.java, LeadershipCommitmentService.java
        LeadershipCommitmentRepository.java, LeadershipCommitmentYearRepository.java
        dto/ (various)
      log/
        Log.java, EntityType.java, ActionType.java
        LogController.java, LogService.java, LogRepository.java
        dto/ (LogResponse, CreateLogRequest)
        utils/ (LogDetailsBuilder.java)
      macroprocess/
        MacroProcess.java, MacroProcessYear.java
        MacroProcessController.java, MacroProcessService.java, MacroProcessYearService.java
        MacroProcessRepository.java, MacroProcessYearRepository.java
        MacroProcessYearController.java
        dto/ (various)
      measurement/
        Measurement.java
        MeasurementController.java, MeasurementService.java, MeasurementRepository.java
        dto/ (CreateMeasurementRequest, MeasurementResponse)
      nonconformity/
        NonConformity.java, CorrectiveAction.java, NonConformityYear.java
        NonConformityStatus.java, NonConformityOrigin.java, CorrectiveActionStatus.java
        NonConformityController.java, NonConformityService.java
        NonConformityRepository.java, CorrectiveActionRepository.java, NonConformityYearRepository.java
        dto/ (various)
      process/
        Process.java, ProcessYear.java
        ProcessController.java, ProcessService.java
        ProcessRepository.java, ProcessYearRepository.java
        dto/ (various)
      processindicatoryear/
        ProcessIndicatorYear.java
      qualityobjective/
        QualityObjective.java, QualityObjectiveYear.java, QualityObjectiveStatus.java
        QualityObjectiveController.java, QualityObjectiveService.java
        QualityObjectiveRepository.java, QualityObjectiveYearRepository.java
        dto/ (various)
      resources/
        equipment/
          Equipment.java, EquipmentYear.java, MaintenanceRecord.java, MaintenanceType.java
          CalibrationRecord.java, CalibrationResult.java
          EquipmentController.java, EquipmentService.java
          EquipmentRepository.java, EquipmentYearRepository.java, etc.
          dto/ (various)
        human/
          HumanResource.java, HumanResourceYear.java, Competency.java
          HumanResourceController.java, HumanResourceService.java
          HumanResourceRepository.java, HumanResourceYearRepository.java, CompetencyRepository.java
          dto/ (various)
        infrastructure/
          Infrastructure.java, InfrastructureYear.java
          InfrastructureController.java, InfrastructureService.java
          InfrastructureRepository.java, InfrastructureYearRepository.java
          dto/ (various)
      responsibilityauthority/
        ResponsibilityAuthority.java
        ResponsibilityAuthorityController.java, ResponsibilityAuthorityService.java, ResponsibilityAuthorityRepository.java
        dto/ (ResponsibilityAuthorityResponse, UpdateResponsibilityAuthorityRequest)
      riskopportunity/
        RiskOpportunity.java, RiskOpportunityYear.java, RiskOpportunityType.java
        RiskAction.java, ActionStatus.java, RiskDecision.java
        RiskOpportunityController.java, RiskOpportunityService.java, RiskOpportunityYearService.java
        RiskOpportunityRepository.java, RiskOpportunityYearRepository.java
        dto/ (various)
      scope/
        Scope.java
        ScopeController.java, ScopeService.java, ScopeRepository.java
        dto/ (ScopeResponse, UpdateScopeRequest)
      security/
        JwtUserContextFilter.java, UserContext.java, UserContextHolder.java
      swot/
        SwotAnalysis.java, SwotItem.java, SwotItemType.java, SwotYear.java
        SwotAnalysisController.java, SwotAnalysisService.java
        SwotAnalysisRepository.java, SwotItemRepository.java, SwotYearRepository.java
        dto/ (various)
      systempolicy/
        SystemPolicy.java
        SystemPolicyController.java, SystemPolicyService.java, SystemPolicyRepository.java
        dto/ (SystemPolicyResponse, UpdateSystemPolicyRequest)
      user/
        User.java, Role.java
        UserController.java, UserService.java, UserReferenceService.java, UserRepository.java
        dto/ (CreateUserRequest, CreateUserResponse, UserDto, UserSummary)
        exception/ (EmailAlreadyExistsException, PasswordsDontMatchException)
      year/
        Year.java
        YearController.java, YearService.java, YearRepository.java
        dto/ (YearResponse, CreateYearRequest, AssociateYearsRequest, YearOption)
    src/main/resources/
      application.yml
      application.properties
      static/
      templates/
```

## 2. Complete API Endpoint Definitions

### Authentication (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with email/password; returns JWT access token + sets refresh token cookie |
| POST | `/api/auth/refresh` | Refresh JWT access token using refresh token from cookie |
| POST | `/api/auth/logout` | Logout; invalidates refresh token and clears cookie |

### Users (`/api/users`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/batch?ids=` | Get multiple users by IDs (batch) |

### Years (`/api/years`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/years` | Create a new year |
| GET | `/api/years` | Get all years |

### Scope (`/api/scope`) — ISO 9001 clause 4.3

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scope` | Get the QMS scope definition (singleton, id=1) |
| PATCH | `/api/scope` | Update the QMS scope definition |
| POST | `/api/scope/document` | Upload and attach a document to the scope |

### System Policy (`/api/system-policy`) — ISO 9001 clause 5.2

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/system-policy` | Get the quality policy (singleton, id=1) |
| PATCH | `/api/system-policy` | Update the quality policy |
| POST | `/api/system-policy/document` | Upload and attach a document to the policy |

### Leadership Commitment (`/api/leadership-commitments`) — ISO 9001 clause 5.1

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leadership-commitments` | Get leadership commitment data |
| PATCH | `/api/leadership-commitments` | Update leadership commitment |
| GET | `/api/leadership-commitments/year/{yearId}` | Get year-specific data |
| POST | `/api/leadership-commitments/years/{yearId}/documents` | Upload document to a specific year |
| DELETE | `/api/leadership-commitments/documents/{documentId}` | Delete a document |
| PATCH | `/api/leadership-commitments/documents/{documentId}/years` | Update document-year associations |

### Responsibility Authority (`/api/responsibility-authority`) — ISO 9001 clause 5.3

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/responsibility-authority` | Get responsibility/authority definition (singleton, id=1) |
| PATCH | `/api/responsibility-authority` | Update responsibility/authority |
| POST | `/api/responsibility-authority/document` | Upload and attach a document |

### Awareness (`/api/awareness`) — ISO 9001 clause 7.3

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/awareness` | Get awareness data |
| PATCH | `/api/awareness` | Update awareness |
| GET | `/api/awareness/year/{yearId}` | Get year-specific awareness data |
| POST | `/api/awareness/years/{yearId}/documents` | Upload document to year |
| DELETE | `/api/awareness/documents/{documentId}` | Delete a document |
| PATCH | `/api/awareness/documents/{documentId}/years` | Update document-year associations |

### Communication (`/api/communications`) — ISO 9001 clause 7.4

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/communications` | Create a communication entry |
| PATCH | `/api/communications/{id}` | Update a communication |
| DELETE | `/api/communications/{id}` | Delete a communication (all years) |
| DELETE | `/api/communications/{id}/years/{yearId}` | Disassociate a year from a communication |
| POST | `/api/communications/{id}/years/{yearId}` | Associate a year with a communication |
| POST | `/api/communications/{id}/years/{yearId}/items` | Add a communication item to a year |
| PATCH | `/api/communications/{id}/items/{itemId}` | Update a communication item |
| DELETE | `/api/communications/{id}/items/{itemId}` | Delete a communication item |
| GET | `/api/communications/year/{yearId}` | Get communications by year |

### SWOT Analysis (`/api/swot-analysis`) — ISO 9001 clause 4.1

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/swot-analysis` | Get SWOT analysis data |
| PATCH | `/api/swot-analysis` | Update SWOT analysis |
| POST | `/api/swot-analysis/documents` | Upload document to SWOT |
| DELETE | `/api/swot-analysis/documents/{documentId}` | Remove a document |
| GET | `/api/swot-analysis/year/{yearId}` | Get year-specific SWOT data |
| POST | `/api/swot-analysis/items` | Create a SWOT item (strength/weakness/opportunity/threat) |
| PATCH | `/api/swot-analysis/items/{itemId}` | Update a SWOT item |
| DELETE | `/api/swot-analysis/items/{itemId}` | Delete a SWOT item |
| PATCH | `/api/swot-analysis/items/{itemId}/years` | Update SWOT item-year associations |

### Interested Parties (`/api/interested-parties`) — ISO 9001 clause 4.2

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/interested-parties` | Create an interested party |
| GET | `/api/interested-parties/year/{yearId}` | Get interested parties by year |
| PUT | `/{id}/processes/associate` | Associate processes with a party-year |
| PUT | `/{id}/processes/disassociate` | Disassociate processes |
| PUT | `/{id}/years/associate` | Associate years |
| PUT | `/{id}/years/associate/full` | Associate years with children |
| PUT | `/{id}/years/disassociate` | Disassociate years |
| POST | `/{id}/document` | Upload document for interested party |

### Macro Process (`/api/macroprocesses`) — ISO 9001 clause 4.4

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/macroprocesses` | Create a macro process |
| PATCH | `/api/macroprocesses/{id}` | Update a macro process |
| GET | `/api/macroprocesses?yearId=` | Get macro processes by year |
| POST | `/{macroProcessId}/years/associate` | Associate years |
| POST | `/{macroProcessId}/years/disassociate` | Disassociate years |
| POST | `/{macroProcessId}/years/disassociate/full` | Disassociate years with children |
| POST | `/{macroProcessId}/years/associate/full` | Associate years with children |
| GET | `/api/macroprocesses/year/{yearId}/options` | Get macro process options for a year |

### Macro Process Hierarchy (`/api/macroprocess-hierarchy`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/macroprocess-hierarchy/{yearId}` | Get full process hierarchy for a year |

### Processes (`/api/processes`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/processes` | Create a process |
| POST | `/api/processes/associate` | Associate processes with a macro process |
| POST | `/api/processes/disassociate` | Disassociate processes from macro process |
| POST | `/api/processes/move` | Move a process between macro processes |
| GET | `/api/processes/year/{yearId}/options` | Get process options by year |
| DELETE | `/api/processes/process-years/{processYearId}` | Delete a process-year |
| PATCH | `/api/processes/{id}` | Update a process |

### Indicators (`/api/indicators`) — ISO 9001 clause 9.1

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/indicators` | Create an indicator |
| POST | `/api/indicators/process/{processYearId}` | Create an indicator within a process year |
| POST | `/api/indicators/associate` | Associate indicators with a process |
| POST | `/api/indicators/disassociate` | Disassociate indicators from a process |
| POST | `/api/indicators/associate-to-processes` | Associate an indicator to processes |
| POST | `/api/indicators/disassociate-from-processes` | Disassociate an indicator from processes |
| GET | `/api/indicators/year/{yearId}` | Get all indicators for a year |
| GET | `/api/indicators/year/{yearId}/options` | Get indicator options for a year |

### Measurements (`/api/measurements`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/measurements/indicator-year/{indicatorYearId}` | Create a measurement for an indicator-year |

### Quality Objectives (`/api/quality-objectives`) — ISO 9001 clause 6.2

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/quality-objectives` | Create a quality objective |
| PATCH | `/api/quality-objectives/{id}` | Update a quality objective |
| DELETE | `/api/quality-objectives/{id}` | Delete a quality objective (all years) |
| DELETE | `/api/quality-objectives/{id}/years/{yearId}` | Remove a year from a quality objective |
| POST | `/api/quality-objectives/{id}/years` | Associate years |
| GET | `/api/quality-objectives/year/{yearId}` | Get quality objectives by year |

### Risk & Opportunity (`/api/risk-opportunities`) — ISO 9001 clause 6.1

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/risk-opportunities` | Create a risk/opportunity |
| PATCH | `/api/risk-opportunities/{id}` | Update a risk/opportunity |
| GET | `/api/risk-opportunities/year/{yearId}` | Get risk/opportunities grouped by year |
| POST | `/{riskOpportunityYearId}/processes` | Associate processes with a risk/opportunity year |
| DELETE | `/{riskOpportunityYearId}/processes` | Disassociate processes |
| POST | `/{id}/years/associate` | Associate years with a risk/opportunity |

### Non-Conformities (`/api/non-conformities`) — ISO 9001 clause 10.2

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/non-conformities` | Create a non-conformity |
| PATCH | `/api/non-conformities/{id}` | Update a non-conformity |
| DELETE | `/api/non-conformities/{id}` | Delete a non-conformity |
| GET | `/api/non-conformities/year/{yearId}` | Get non-conformities by year |
| PATCH | `/{id}/years/{yearId}` | Update a specific non-conformity year |
| PATCH | `/{id}/years` | Update all years for a non-conformity |
| POST | `/{id}/corrective-actions` | Create a corrective action |
| PATCH | `/{id}/corrective-actions/{actionId}` | Update a corrective action |
| DELETE | `/{id}/corrective-actions/{actionId}` | Delete a corrective action |
| POST | `/{id}/corrective-actions/{actionId}/documents` | Upload document to a corrective action |
| DELETE | `/{id}/corrective-actions/{actionId}/documents/{documentId}` | Remove document from corrective action |

### Documents (`/api/documents`) — ISO 9001 clause 7.5

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/documents/upload` | Upload a document with metadata (multipart) |
| POST | `/api/documents/versions/{versionId}/approve` | Approve a document version |
| DELETE | `/api/documents/{documentId}` | Delete a document |
| GET | `/api/documents/{documentId}/with-versions` | Get a document with all versions |
| DELETE | `/api/documents/versions/{versionId}` | Delete a document version |
| GET | `/api/documents/versions/{versionId}/download/{fileName}` | Download a document version file |

### Changes (`/api/changes`) — ISO 9001 clause 6.3

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/changes` | Create a change |
| PUT | `/api/changes/{id}` | Full update a change |
| PATCH | `/api/changes/{id}` | Partial update a change |
| GET | `/api/changes` | Get all changes |
| GET | `/api/changes/year/{year}` | Get changes by year |
| DELETE | `/api/changes/{id}` | Delete a change |

### Equipment (`/api/equipments`) — ISO 9001 clause 7.1.3/7.1.5

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/equipments` | Create equipment |
| PATCH | `/api/equipments/{id}` | Update equipment |
| DELETE | `/api/equipments/{id}` | Delete equipment (all years) |
| DELETE | `/api/equipments/{id}/years/{yearId}` | Remove year from equipment |
| POST | `/api/equipments/{id}/years` | Associate years (with isActive flag) |
| GET | `/api/equipments/year/{yearId}` | Get equipment by year |
| POST | `/api/equipments/{id}/maintenance` | Add a maintenance record |
| GET | `/api/equipments/{id}/maintenance` | Get maintenance records |
| DELETE | `/api/equipments/{id}/maintenance/{recordId}` | Delete a maintenance record |
| POST | `/api/equipments/{id}/calibration` | Add a calibration record |
| GET | `/api/equipments/{id}/calibration` | Get calibration records |
| DELETE | `/api/equipments/{id}/calibration/{recordId}` | Delete a calibration record |

### Human Resources (`/api/human-resources`) — ISO 9001 clause 7.2

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/human-resources` | Create a human resource |
| POST | `/{id}/competencies` | Create competency (with optional document upload) |
| POST | `/{id}/competencies/{competencyId}/document` | Upload document to a competency |
| PATCH | `/{id}` | Update a human resource |
| DELETE | `/{id}` | Delete a human resource (all years) |
| DELETE | `/{id}/years/{yearId}` | Remove a year from human resource |
| POST | `/{id}/years` | Associate years |
| GET | `/year/{yearId}` | Get human resources by year |

### Infrastructure (`/api/infrastructures`) — ISO 9001 clause 7.1.3

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/infrastructures` | Create infrastructure |
| PATCH | `/api/infrastructures/{id}` | Update infrastructure |
| DELETE | `/api/infrastructures/{id}` | Delete infrastructure (all years) |
| DELETE | `/api/infrastructures/{id}/years/{yearId}` | Remove a year |
| POST | `/api/infrastructures/{id}/years` | Associate years (with isActive flag) |
| GET | `/api/infrastructures/year/{yearId}` | Get infrastructures by year |

### Logs (`/api/logs`) — Audit trail

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/logs` | Get paginated audit logs with filters: `entityType`, `baseEntityId`, `entityYearId`, `yearId`, `action`, `startDate`, `endDate`, `page`, `size` |

## 3. Data Models / Schemas

### Core/Reference Models

**Year** — The multi-year dimension (almost everything is scoped by year)
- `id` (Long, PK), `year` (Integer, unique)

**User** (`app_user` table)
- `id` (Long, PK), `firstName`, `lastName`, `email` (unique), `password`, `roles` (Set of Role)

**Role** (enum): `ROLE_USER`, `ROLE_ADMIN`, `ROLE_AUDITOR`

**RefreshToken** (`refresh_tokens` table)
- `id`, `token` (unique), `user` (@OneToOne), `expiresAt` (Instant), `revoked` (boolean)

### ISO 9001 QMS Domain Models

**Scope** (singleton, id=1) — Clause 4.3
- `id` (Long, PK fixed=1), `description` (TEXT), `document` (@OneToOne Document)

**SystemPolicy** (singleton, id=1) — Clause 5.2
- `id` (Long, PK fixed=1), `description` (TEXT), `document` (@OneToOne Document)

**LeadershipCommitment** (singleton, id=1) — Clause 5.1
- `id` (PK=1), `description` (TEXT), `years` (List<LeadershipCommitmentYear>)

  **LeadershipCommitmentYear**: `id`, `leadershipCommitment` (@ManyToOne), `year` (@OneToOne Year), `documents` (ManyToMany Document)

**ResponsibilityAuthority** (singleton, id=1) — Clause 5.3
- `id` (PK=1), `description` (TEXT), `document` (@OneToOne Document)

**Awareness** (singleton, id=1) — Clause 7.3
- `id` (PK=1), `description` (TEXT), `years` (List<AwarenessYear>)

  **AwarenessYear**: `id`, `awareness` (@ManyToOne), `year` (@OneToOne Year), `documents` (ManyToMany Document)

**SwotAnalysis** — Clause 4.1
- `id` (PK=1), `description` (TEXT), `documents` (ManyToMany Document), `years` (List<SwotYear>)

  **SwotYear**: `id`, `swotAnalysis` (@ManyToOne), `year` (@OneToOne Year), `items` (ManyToMany SwotItem)

  **SwotItem**: `id`, `text` (TEXT), `type` (Enum: STRENGTH, WEAKNESS, OPPORTUNITY, THREAT), `swotYears` (ManyToMany SwotYear)

**InterestedParty** — Clause 4.2
- `id` (PK), `name`, `type` (Enum: INTERNAL, EXTERNAL), `category`, `contactInfo`, `years` (List<InterestedPartyYear>)

  **InterestedPartyYear**: `id`, `year` (@OneToOne Year), `needs` (TEXT), `communicationAndMonitoringPlan` (TEXT), `interestedParty` (@ManyToOne), `processes` (ManyToMany ProcessYear), `evidences` (ManyToMany Document)

**Communication** — Clause 7.4
- `id` (PK), `objective`, `scope`, `plan`, `years` (List<CommunicationYear>)

  **CommunicationYear**: `id`, `communication` (@ManyToOne), `year` (@OneToOne Year)

  **CommunicationItem**: `id`, `communication` (@ManyToOne), `year` (@ManyToOne Year), `what`, `who`, `toWho`, `when`, `where`, `how`, `type` (Enum: INTERNAL, EXTERNAL)

**Document** (`documents` table) — Clause 7.5
- `id` (PK), `versioned` (Boolean), `versions` (OneToMany DocumentVersion), `currentVersion` (@OneToOne DocumentVersion)

  **DocumentVersion**: `id`, `document` (@ManyToOne), `version` (double), `fileName`, `fileType`, `fileUrl`, `uploadedBy` (@ManyToOne User), `uploadedAt`, `status` (Enum: UNDER_REVIEW, APPROVED, OBSOLETE), `approvedAt`, `obsoleteAt`

  **DocumentType** (enum): `SCOPE`, `SYSTEM_POLICY`, `GENERIC`

**MacroProcess** (`macro_processes` table) — Clause 4.4
- `id` (PK), `name` (unique), `macroProcessYears` (OneToMany MacroProcessYear)

  **MacroProcessYear**: `id`, `macroProcess` (@ManyToOne), `year` (@ManyToOne Year), `processes` (OneToMany ProcessYear)

**Process** (`processes` table) — Clause 4.4
- `id` (PK), `name`, `objective` (2000 chars), `owner` (@ManyToOne User), `processYears` (OneToMany ProcessYear)

  **ProcessYear**: `id`, `process` (@ManyToOne), `year` (@ManyToOne Year), `macroProcessYear` (@ManyToOne MacroProcessYear), `indicators` (ManyToMany IndicatorYear), `interestedParties` (ManyToMany InterestedPartyYear), `risks` (ManyToMany RiskOpportunityYear), `qualityObjectives` (ManyToMany QualityObjectiveYear)

**Indicator** (`indicators` table) — Clause 9.1
- `id` (PK), `name` (unique), `formula`, `frequency` (Enum: ANNUAL, SEMESTER, TRIMESTER, MONTHLY, WEEKLY), `notes` (2000 chars), `valueType` (Enum: NUMBER, PERCENTAGE, RATIO, TIME, CURRENCY), `responsible` (@ManyToOne User), `indicatorYears` (OneToMany IndicatorYear)

  **IndicatorYear**: `id`, `indicator` (@ManyToOne), `year` (@ManyToOne Year), `goal` (BigDecimal), `processes` (ManyToMany ProcessYear), `measurements` (OneToMany Measurement), `qualityObjectives` (ManyToMany QualityObjectiveYear)

**Measurement** (`measurements` table)
- `id` (PK), `measurementValue` (BigDecimal), `measurementDate` (LocalDate), `notes` (1000 chars), `indicatorYear` (@ManyToOne IndicatorYear)

**QualityObjective** — Clause 6.2
- `id` (PK), `objectiveTitle`, `description`, `responsible` (@ManyToOne User), `years` (OneToMany QualityObjectiveYear)

  **QualityObjectiveYear**: `id`, `qualityObjective` (@ManyToOne), `year` (@ManyToOne Year), `status` (Enum: ACHIEVED, IN_PROGRESS), `processes` (ManyToMany ProcessYear), `indicators` (ManyToMany IndicatorYear)

**RiskOpportunity** — Clause 6.1
- `id` (PK), `origin`, `description`, `category`, `type` (Enum: RISK, OPPORTUNITY), `years` (OneToMany RiskOpportunityYear)

  **RiskOpportunityYear**: `id`, `riskOpportunity` (@ManyToOne), `year` (@OneToOne Year), `impact` (1-5), `probability` (1-5), `riskLevel` (impact*probability), `decision` (Enum: ACCEPT, MITIGATE, TRANSFER, AVOID), `processes` (ManyToMany ProcessYear), `actions` (OneToMany RiskAction)

  **RiskAction**: `id`, `title`, `responsible` (@ManyToOne User), `effectivenessEvaluationMethod`, `status` (Enum: OPEN, IN_PROGRESS, CLOSED), `notes`, `riskOpportunityYear` (@ManyToOne), `monitoringQ1`, `monitoringQ2`, `monitoringQ3`, `monitoringQ4`

**NonConformity** — Clause 10.2
- `id` (PK), `name`, `description` (TEXT), `cause` (TEXT), `responsible` (@ManyToOne User), `origin` (Enum: INTERNAL_AUDIT, CLIENT, EXTERNAL_AUDIT, NOT_SPECIFIED), `years` (OneToMany NonConformityYear), `correctiveActions` (OneToMany CorrectiveAction)

  **NonConformityYear**: `id`, `nonConformity` (@ManyToOne), `year` (@OneToOne Year), `status` (Enum: OPEN, UNDER_TREATMENT, FINISHED, CLASSIFIED), `evaluation` (TEXT), `evaluationDescription` (TEXT)

  **CorrectiveAction**: `id`, `name`, `description` (TEXT), `responsible` (@ManyToOne User), `status` (Enum: REGISTERED, IN_PROGRESS, FINISHED), `progressDescription` (TEXT), `nonConformity` (@ManyToOne), `documents` (ManyToMany Document)

**Change** (`changes` table) — Clause 6.3
- `id` (PK), `description`, `origin`, `whatWillBeDone`, `why`, `createdBy` (@ManyToOne User), `startDate`, `expectedEndDate`, `realEndDate`, `timeLimitInDays`, `where`, `how`, `howMuch`, `status` (Enum: INITIATED, IN_PROGRESS, FINISHED, CANCELLED), `notes` (2000 chars), `createdAt`

**Equipment** — Clause 7.1.3/7.1.5
- `id` (PK), `name`, `type`, `location`, `responsible` (@ManyToOne User), `years` (OneToMany EquipmentYear), `maintenanceHistory` (OneToMany MaintenanceRecord), `calibrationHistory` (OneToMany CalibrationRecord)

  **EquipmentYear**: `id`, `equipment` (@ManyToOne), `year` (@ManyToOne Year), `isActive` (boolean)

  **MaintenanceRecord**: `id`, `equipment` (@ManyToOne), `date`, `type`, `performedBy`, `description`

  **CalibrationRecord**: `id`, `equipment` (@ManyToOne), `date`, `performedBy`, `result`, `description`

**HumanResource** — Clause 7.2
- `id` (PK), `name`, `function`, `department`, `years` (OneToMany HumanResourceYear)

  **HumanResourceYear**: `id`, `humanResource` (@ManyToOne), `year` (@ManyToOne Year), `isActive` (boolean), `competencies` (OneToMany Competency)

  **Competency**: `id`, `name`, `details`, `document` (@ManyToOne Document), `humanResourceYear` (@ManyToOne HumanResourceYear)

**Infrastructure** — Clause 7.1.3
- `id` (PK), `name`, `type`, `location`, `responsible` (@ManyToOne User), `maintenance`, `years` (OneToMany InfrastructureYear)

  **InfrastructureYear**: `id`, `infrastructure` (@ManyToOne), `year` (@ManyToOne Year), `isActive` (boolean)

### Audit/Log Models

**Log** (`logs` table)
- `id`, `user` (@ManyToOne User), `timestamp` (auto), `entityType` (Enum covering all entity types), `baseEntityId` (Long), `entityYearId` (Long), `yearId` (Long), `entityName`, `action` (Enum: CREATED, UPDATED, DELETED, ASSOCIATED, DISASSOCIATED), `details` (JSON)

### Join Entity

**ProcessIndicatorYear** — Join table entity for ProcessYear-IndicatorYear
- `id`, `processYear` (@ManyToOne), `indicatorYear` (@ManyToOne), unique constraint on (`process_year_id`, `indicator_year_id`)

## 4. API Structure Summary

**Framework**: Spring Boot (Java) with Spring Data JPA, Spring Security, Spring OAuth2 Resource Server

**Database**: H2 in-memory (development), JPA with Hibernate DDL auto-update

**Authentication**: JWT-based auth system with:
- Login returns an access token (1-hour expiry) + refresh token (30-day cookie)
- Refresh token endpoint to renew access tokens
- Logout invalidates refreshing
- Currently, all endpoints are set to `permitAll()` (auth is disabled/commented out in SecurityConfig)
- Roles defined: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_AUDITOR`

**REST Patterns**:
- Standard RESTful conventions with `/api` prefix
- Singleton resources (Scope, SystemPolicy, LeadershipCommitment, Awareness, ResponsibilityAuthority, SwotAnalysis) use GET/PATCH on the collection path
- Collection resources use POST for create, GET for list, PATCH for update, DELETE for delete
- Year-based filtering is pervasive: almost every domain entity uses a `Year` dimension for multi-year QMS data
- Year association/disassociation is patterned as POST/DELETE on `/{id}/years/associate` or `/{id}/years/disassociate`
- Document management is cross-cutting — documents can be attached to Scope, SystemPolicy, LeadershipCommitment, Awareness, Responsibility, InterestedParty, Competency, CorrectiveAction
- Documents support versioning with status workflow (UNDER_REVIEW → APPROVED → OBSOLETE)
- File uploads use multipart form-data (`@RequestPart`)

**Swagger/OpenAPI**: Available at `/swagger-ui.html` with API docs at `/v3/api-docs`

**CORS**: Configured to allow `http://localhost:5173` (likely a React/Vite frontend)

**Design Pattern**: Each QMS domain follows a consistent pattern:
- Entity + Year entity (for multi-year data)
- Repository (Spring Data JPA)
- Service layer
- Controller with REST endpoints
- DTO classes for request/response