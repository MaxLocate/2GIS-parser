interface IKeyItem {
    id: string;
    active: boolean;
    count: number;
}

export interface IKeyItems {
    items: IKeyItem[];
}
