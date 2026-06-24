import {supabase} from '../config/supabase.js'

export const getBudgetsService = async (usuario_id) => {
    const {data, error} = await supabase
        .from("presupuestos")
        .select("*")
        .eq("usuario_id", usuario_id)
    
    if (error) {
        throw new Error(error.message)
    }

    return data 
}