import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Point = {
  x: number;
  y: number;
};

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface BrandCategory {
  brand_id: string;
  category_id: string;
}

export interface Brands {
  display_name: string;
  id: Generated<string>;
  supported_ecosystem_id: string | null;
}

export interface Categories {
  active: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
  description: string | null;
  externals: Json | null;
  id: string;
  internal: Generated<boolean>;
  label: string;
  modified_at: Timestamp;
  parent_id: string | null;
  slug: string;
}

export interface CategoryImages {
  banner: string | null;
  category_id: string;
  full: string | null;
  teaser: string | null;
}

export interface CategoryTypesAllowed {
  category_id: string;
  communication: Generated<boolean | null>;
  content: Generated<boolean | null>;
  inventory: Generated<boolean | null>;
  task: Generated<boolean | null>;
}

export interface ClimateCounties {
  ba_climate_zone: string | null;
  county_fips: string;
  iecc_climate_zone: number | null;
  iecc_moisture_regime: string | null;
}

export interface Counties {
  fips: string;
  label: string | null;
  state_code: string;
}

export interface Countries {
  code: string;
  name: string;
}

export interface DataSources {
  display_name: string;
  type: string;
}

export interface ServiceProviderEcosystems {
  service_provider_id: string;
  supported_ecosystem_id: string;
}

export interface ServiceProviders {
  address: string;
  city: string;
  contact_email: string;
  contact_email_domains: Json | null;
  country_code: string | null;
  created_at: Generated<Timestamp>;
  created_by: string;
  display_name: string;
  domains: Json;
  id: Generated<string>;
  location: Point | null;
  modified_at: Timestamp | null;
  modified_by: string | null;
  name: string;
  phone: string;
  source_subscriptions: Json | null;
  state_province_code: string | null;
  status: string;
  support_email: string;
  timezone: string;
  zip_code: string | null;
}

export interface ServiceProviderStatuses {
  description: string | null;
  status: string;
}

export interface ServiceProviderUsers {
  app_user_id: string | null;
  id: string;
  service_provider_id: string | null;
}

export interface Source7Brands {
  brand_name: string;
  id: number;
}

export interface SpaceTypes {
  display_name: string;
  type: string;
}

export interface StatesProvinces {
  code: string;
  country_code: string;
  name: string;
}

export interface SupportedEcosystems {
  connection_type: string;
  display_name: string;
  id: Generated<string>;
  name: string;
  provider_type: string;
}

export interface SystemImages {
  created_at: Generated<Timestamp>;
  created_by: string | null;
  id: Generated<string>;
  service_provider_id: string | null;
  url: string;
}

export interface TimeZones {
  description: string;
  iana_identifier: string;
  utc_offset: string;
}

export interface UserImages {
  building_id: string;
  created_at: Generated<Timestamp>;
  created_by: string;
  id: Generated<string>;
  original_key: string;
  resized_key: string | null;
}

export interface DB {
  brand_category: BrandCategory;
  brands: Brands;
  categories: Categories;
  category_images: CategoryImages;
  category_types_allowed: CategoryTypesAllowed;
  climate_counties: ClimateCounties;
  counties: Counties;
  countries: Countries;
  data_sources: DataSources;
  service_provider_ecosystems: ServiceProviderEcosystems;
  service_provider_statuses: ServiceProviderStatuses;
  service_provider_users: ServiceProviderUsers;
  service_providers: ServiceProviders;
  source7_brands: Source7Brands;
  space_types: SpaceTypes;
  states_provinces: StatesProvinces;
  supported_ecosystems: SupportedEcosystems;
  system_images: SystemImages;
  time_zones: TimeZones;
  user_images: UserImages;
}
