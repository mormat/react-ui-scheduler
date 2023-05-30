/*
 *  Every types defined in this script will behave like a built in Typescript type
 */

type Nullable<T> = T | null;

type Dictionary<K=string,T = any> = {[key: K]: T};