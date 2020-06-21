create table customer
(
	id char(20) default random_string(20) not null
		constraint customer_pk
			primary key,
	name text not null
);

alter table customer owner to postgres;

create unique index customer_id_uindex
	on customer (id);

create table domain
(
	domain text not null
		constraint domains_pk
			primary key,
	customer_id char(20) not null
		constraint domains_customer_id
			references customer
				on update cascade on delete restrict
);

alter table domain owner to postgres;

create unique index domains_domain_uindex
	on domain (domain);

create table "user"
(
	email text not null
		constraint user_pk
			primary key,
	domain text not null
		constraint user_domain_domain_fk
			references domain
				on update cascade on delete restrict,
	google_access_token text not null,
	customer_admin boolean default false not null,
	google_refresh_token text,
	additional_info json not null
);

alter table "user" owner to postgres;

create unique index user_email_uindex
	on "user" (email);

create table blueprint
(
	google_docs_id text not null,
	user_email text
		constraint blueprint_user_email_fk
			references "user"
				on update cascade on delete restrict,
	id bigserial not null
		constraint blueprint_pk
			primary key,
	name text not null
);

alter table blueprint owner to postgres;

create unique index blueprint_google_docs_id_user_email_uindex
	on blueprint (google_docs_id, user_email);

create unique index blueprint_id_uindex
	on blueprint (id);

create table blueprint_field
(
	id bigserial not null
		constraint blueprint_field_pk
			primary key,
	blueprint_id bigserial not null
		constraint blueprint_field_blueprint_id_fk
			references blueprint
				on update cascade on delete restrict,
	name text not null,
	type text not null
);

alter table blueprint_field owner to postgres;

create unique index blueprint_field_id_uindex
	on blueprint_field (id);

create table blueprints_group
(
	id bigserial not null
		constraint blueprints_group_pk
			primary key,
	name text not null,
	created_at timestamp default now() not null,
	created_by text not null
		constraint blueprints_group_user_email_fk
			references "user"
);

alter table blueprints_group owner to postgres;

create unique index blueprints_group_id_uindex
	on blueprints_group (id);

create table blueprint_blueprints_group
(
	blueprint_id bigserial not null
		constraint blueprint_blueprint_group_blueprint_id_fk
			references blueprint
				on update cascade on delete restrict,
	blueprint_group_id bigserial not null
		constraint blueprint_blueprint_group_blueprints_group_id_fk
			references blueprints_group
				on update cascade on delete restrict
);

alter table blueprint_blueprints_group owner to postgres;

create unique index blueprint_blueprints_group_blueprint_id_blueprint_group_id_uind
	on blueprint_blueprints_group (blueprint_id, blueprint_group_id);

create table blueprints_group_submit
(
	id bigserial not null
		constraint blueprint_submit_pk
			primary key,
	submitted_at timestamp default now() not null,
	submitted_by_email text not null
		constraint blueprint_submit_user_email_fk
			references "user"
				on update cascade on delete restrict,
	blueprints_group_id bigserial not null
		constraint blueprints_group_submit_blueprints_group_id_fk
			references blueprints_group
				on update cascade on delete restrict,
	folder_id text not null
);

alter table blueprints_group_submit owner to postgres;

create table document
(
	id bigserial not null
		constraint document_pk
			primary key,
	google_docs_id text not null,
	blueprint_id bigserial not null
		constraint document_blueprint_id_fk
			references blueprint
				on update cascade on delete restrict,
	blueprints_submit_group_id bigserial not null
		constraint document_blueprints_group_submit_id_fk
			references blueprints_group_submit
				on update cascade on delete restrict
);

alter table document owner to postgres;

create unique index document_id_uindex
	on document (id);

create unique index blueprint_submit_id_uindex
	on blueprints_group_submit (id);

create table filled_blueprint_field
(
	id bigserial not null
		constraint filled_blueprint_field_pk
			primary key,
	blueprints_group_submit_id bigserial not null
		constraint filled_blueprint_field_blueprints_group_submit_id_fk
			references blueprints_group_submit
				on update cascade on delete restrict,
	value text,
	name text not null,
	type text not null
);

alter table filled_blueprint_field owner to postgres;

create unique index filled_blueprint_field_id_uindex
	on filled_blueprint_field (id);

create table generated_document
(
	id bigserial not null
		constraint submitted_blueprint_pk
			primary key,
	name text not null,
	google_doc_id text,
	pdf_id text,
	blueprints_group_submit_id bigserial not null
		constraint submitted_blueprint_blueprints_group_submit_id_fk
			references blueprints_group_submit
);

alter table generated_document owner to postgres;

create unique index submitted_blueprint_id_uindex
	on generated_document (id);

create table incrementing_field_type
(
	customer_id char(20) not null
		constraint incrementing_field_customer_id_fk
			references customer
				on update cascade on delete restrict,
	template text,
	name text not null,
	id bigserial not null
		constraint incrementing_field_type_pk
			primary key,
	constraint incrementing_field_pk
		unique (customer_id, name)
);

alter table incrementing_field_type owner to postgres;

create unique index incrementing_field_type_id_uindex
	on incrementing_field_type (id);

create table incrementing_field_value
(
	incrementing_field_type_id bigint not null
		constraint incrementing_field_value_incrementing_field_type_id_fk
			references incrementing_field_type
				on update cascade on delete restrict,
	value integer not null,
	blueprints_group_id bigserial
		constraint incrementing_field_value_blueprints_group_id_fk
			references blueprints_group
				on update cascade on delete set null
);

alter table incrementing_field_value owner to postgres;

create function random_string(randomlength integer) returns text
	leakproof
	strict
	language sql
as $$
SELECT array_to_string(
               ARRAY(
                       SELECT substring(
                                      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                                      trunc(random()*62)::int+1,
                                      1
                                  )
                       FROM generate_series(1,randomLength) AS gs(x)
                   )
           , ''
           )
$$;

alter function random_string(integer) owner to postgres;

