// Importamos y cargamos variables de entorno antes de leerlas
import { config } from 'dotenv';
import { join } from 'path';
import * as joi from 'joi';

config({ path: join(process.cwd(), '.env') });

// Creamos una interfaz que se encargue de mejorar el tipado de nuestro código
interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
}

// Schema Joi Config
const envsSchema = joi
  .object({
    PORT: joi.number().required(), // le damos tipo e indicamos que es requerido
    DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

// Validamos las variables de entorno; retorna error y las variables
const { error, value } = envsSchema.validate(process.env);

// Si hay error, lanzamos una excepción con el mensaje de error
if (error) throw new Error(`Config validation error: ${error.message}`);
const envVars: EnvVars = value;

// Exportamos las variables de entorno
export const envs = {
  PORT: envVars.PORT,
  DATABASE_URL: envVars.DATABASE_URL,
};
