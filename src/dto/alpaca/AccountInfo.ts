export interface AccountInfo {
    id: string
    account_number: string
    status: string
    crypto_status: string
    kyc_results: KycResults
    currency: string
    last_equity: string
    created_at: string
    contact: Contact
    identity: Identity
    disclosures: Disclosures
    agreements: Agreement[]
    documents: Document[]
    trusted_contact: TrustedContact
    account_type: string
    trading_configurations: any
    enabled_assets: string[]
}

export interface KycResults {
    reject: Reject
    accept: Accept
    indeterminate: Indeterminate
    summary: string
    additional_information: string
}

export interface KycResultOptions {
    IDENTITY_VERIFICATION?: IdentityVerification
    TAX_IDENTIFICATION?: TaxIdentification
    ADDRESS_VERIFICATION?: AddressVerification
    DATE_OF_BIRTH?: DateOfBirth
    INVALID_IDENTITY_PASSPORT?: InvalidIdentityPassport
    SELFIE_VERIFICATION?: SelfieVerification
    PEP?: Pep
    FAMILY_MEMBER_PEP?: FamilyMemberPep
    CONTROL_PERSON?: ControlPerson
    AFFILIATED?: Affiliated
    VISA_TYPE_OTHER?: VisaTypeOther
    W8BEN_CORRECTION?: W8BenCorrection
    COUNTRY_NOT_SUPPORTED?: CountryNotSupported
    WATCHLIST_HIT?: WatchlistHit
    OTHER?: Other
    OTHER_PARTNER?: OtherPartner
}

export interface Reject extends KycResultOptions {

}

export interface IdentityVerification {
}

export interface TaxIdentification {
}

export interface AddressVerification {
}

export interface DateOfBirth {
}

export interface InvalidIdentityPassport {
}

export interface SelfieVerification {
}

export interface Pep {
}

export interface FamilyMemberPep {
}

export interface ControlPerson {
}

export interface Affiliated {
}

export interface VisaTypeOther {
}

export interface W8BenCorrection {
}

export interface CountryNotSupported {
}

export interface WatchlistHit {
}

export interface Other {
}

export interface OtherPartner {
}

export interface Accept extends KycResultOptions {

}


export interface Indeterminate extends KycResultOptions {

}


export interface Contact {
    email_address: string
    phone_number: string
    street_address: string[]
    unit: string
    city: string
    state: string
    postal_code: string
}

export interface Identity {
    given_name: string
    family_name: string
    middle_name: string
    date_of_birth: string
    tax_id_type: string
    country_of_citizenship: string
    country_of_birth: string
    country_of_tax_residence: string
    funding_source: string[]
    liquid_net_worth_min: string
    liquid_net_worth_max: string
    visa_type: any
    visa_expiration_date: any
    date_of_departure_from_usa: any
    permanent_resident: any
}

export interface Disclosures {
    is_control_person: boolean
    is_affiliated_exchange_or_finra: boolean
    is_politically_exposed: boolean
    immediate_family_exposed: boolean
    is_discretionary: boolean
}

export interface Agreement {
    agreement: string
    signed_at: string
    ip_address: string
    revision: string
}

export interface Document {
    document_type: string
    id: string
    content: string
    created_at: string
}

export interface TrustedContact {
    given_name: string
    family_name: string
    email_address: string
    phone_number: string
    street_address: string[]
    city: string
    state: string
    postal_code: string
    country: string
}
