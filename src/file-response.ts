interface AddressComponent {
    number: string;
    street: string;
    street_id: string;
    type: string;
}

interface Address {
    building_code: string;
    building_id: string;
    components: AddressComponent[];
    postcode: string;
}

interface AdmDiv {
    id: string;
    name: string;
    type: string;
    city_alias?: string;
    flags?: {
        is_default: boolean;
        is_region_center: boolean;
    };
    is_default?: boolean;
}

interface AdsAction {
    caption: string;
    name: string;
    platforms: string[];
    type: string;
    value: string;
}

interface AdsOption {
    actions: AdsAction[];
    branded_advertiser: boolean;
    color: string;
    discount: boolean;
    images: {
        url: string;
    }[];
    logo: {
        img_url: string;
    };
    review: boolean;
}

interface Ads {
    article: string;
    options: AdsOption;
    text: string;
}

interface Attribute {
    id: string;
    name: string;
    tag: string;
}

interface AttributeGroup {
    attributes: Attribute[];
    is_context: boolean;
    is_primary: boolean;
    name: string;
    rubric_ids: string[];
}

interface Contact {
    type: string;
    text: string;
    value: string;
    code?: string;
    print_text?: string;
    url?: string;
}

interface Schedule {
    [day: string]: {
        working_hours: {
            from: string;
            to: string;
        }[];
    };
}

interface ContactGroup {
    contacts: Contact[];
    schedule?: Schedule;
}

interface StopFactor {
    name: string;
    tag: string;
    type: string;
}

interface Context {
    stop_factors: StopFactor[];
}

interface Dates {
    created_at: string;
    updated_at: string;
}

interface ExternalContent {
    count: number;
    main_photo_url: string;
    subtype: string;
    type: string;
}

interface LinksDatabaseEntrances {
    geometry: {
        normals: string[];
        points: string[];
        vectors: string[];
    };
    id: string;
    is_primary: boolean;
    is_visible_on_map: boolean;
}

interface Links {
    database_entrances: LinksDatabaseEntrances[];
    entrances: LinksDatabaseEntrances[];
    nearest_parking: {
        id: string;
    }[];
}

interface Flags {
    photos: boolean;
    has_ads_model: boolean;
    has_apartments_info: boolean;
    has_discount: boolean;
    has_dynamic_congestion: boolean;
    has_exchange: boolean;
    has_goods: boolean;
    has_pinned_goods: boolean;
    has_realty: boolean;
}

interface RootObject {
    address: Address;
    address_comment: string;
    address_name: string;
    adm_div: AdmDiv[];
    ads: Ads;
    attribute_groups: AttributeGroup[];
    city_alias: string;
    contact_groups: ContactGroup[];
    context: Context;
    dates: Dates;
    email_for_sending: {
        allowed: boolean;
    };
    external_content: ExternalContent[];
    flags: Flags;
    has_ads_model: boolean;
    id: string;
    is_promoted: boolean;
    links: Links;
}
