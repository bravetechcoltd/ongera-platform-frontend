
export enum SystemType {
  BWENGEPLUS = "bwengeplus",
  ONGERA = "ongera"
}

export enum BwengeRole {
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  INSTITUTION_ADMIN = "INSTITUTION_ADMIN",
  CONTENT_CREATOR = "CONTENT_CREATOR",
  INSTRUCTOR = "INSTRUCTOR",
  LEARNER = "LEARNER"
}

export enum InstitutionRole {
  ADMIN = "ADMIN",
  CONTENT_CREATOR = "CONTENT_CREATOR",
  INSTRUCTOR = "INSTRUCTOR",
  MEMBER = "MEMBER"
}

export enum AccountType {
  STUDENT = "Student",
  RESEARCHER = "Researcher",
  DIASPORA = "Diaspora",
  INSTITUTION = "Institution",
  ADMIN = "admin"
}

export interface ProtectionMetadata {
  fields_protected: string[]
  last_sync: string
  system_origin: SystemType
  immutable_fields: string[]
}

export interface CrossSystemContext {
  IsForWhichSystem: SystemType
  bwenge_role?: BwengeRole
  primary_institution_id?: string
  institution_ids?: string[]
  institution_role?: InstitutionRole
  extracted_at: string
  synced_from?: SystemType
}