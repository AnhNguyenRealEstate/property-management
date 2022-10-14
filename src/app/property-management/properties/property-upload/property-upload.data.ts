export enum ContractType {
    rental = 'rental',
    brokerage = 'brokerage',
    transaction = 'transaction',
    rental_extension = 'rental_extension'
}

export interface ContractData {
    'PROPERTY_NAME': string,
    'CONTRACT_NUM': string,
    'LANDLORD_NAME': string,
    'TENANT_NAME': string,
    'PROPERTY_ADDR': string,
    'PROPERTY_CATEGORY': string,
    'PROPERTY_PURPOSE': string,
    'START_DATE': string,
    'END_DATE': string,
    'RENTAL_PRICE': string
}