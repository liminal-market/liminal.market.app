export interface Transfer {
    id: string;
    relationship_id: string;
    account_id: string;
    type: string;
    status: string;
    amount: string;
    instant_amount: string;
    direction: string;
    created_at: Date;
    updated_at: Date;
    expires_at: Date;
    reason?: any;
    hold_until?: Date;
    requested_amount: string;
    fee: string;
    fee_payment_method: string;
}