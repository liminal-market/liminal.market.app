export interface BankRelationship {
    id: string;
    account_id: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    account_owner_name: string;
    bank_account_type: string;
    bank_account_number: string;
    bank_routing_number: string;
    nickname?: any;
    processor_token: string;

    name: string;
    country: string;
    state_province: string;
    postal_code: string;
    city: string;
    street_address: string;
    account_number: string;
    bank_code: string;
    bank_code_type: string;
}



