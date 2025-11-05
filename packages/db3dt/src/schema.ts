export type DB3DT = {
  versao: string;
  vantagens?: any[];
  desvantagens?: any[];
  pericias?: any[];
  magias?: any[];
  capitulos?: any[];
};
export type DBIndex = {
  byId: Record<string, any>;
  byNome: Record<string, any>;
  bySlug: Record<string, any>;
};
