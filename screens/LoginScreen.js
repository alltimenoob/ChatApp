import React, { useEffect,useState } from 'react'
import { StyleSheet,Text,View,KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native'
import { auth } from '../firebase'
import {createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth"
import { useNavigation } from '@react-navigation/native'


const LoginScreen = () =>{
    const [email , setEmail ] = useState('')
    const [password , setPassword ] = useState('')

    const navigation = useNavigation()

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(user => {
            if(user){
                navigation.replace("Home")
            }
        })

        return unsub
    },[])

    const headleSignUp = () => {
        createUserWithEmailAndPassword(auth,email,password)
        .then(userCredentials => {
            const user = userCredentials.user;
            console.log(user.email);
        })
        .catch(error => alert(error.message))
    }

    const handleLogin = () => {
        signInWithEmailAndPassword(auth,email,password)
        .then(userCredentials => {
            const user = userCredentials.user
            console.log("Logged In With "+user.email)
        })
        .catch(error=>(console.log(error.message)))
    }
    return(
        <KeyboardAvoidingView
        style={styles.container}
        behavior="padding">
            <View style={styles.inputContainer}>
                <TextInput
                value={email}
                onChangeText={text=>setEmail(text)}
                placeholder='Email'
                style={styles.input}>
                
                </TextInput>
                <TextInput
                value={password}
                onChangeText={text=>setPassword(text)}
                placeholder='Password'
                style={styles.input}
                secureTextEntry>
                
                </TextInput>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLogin}
                style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={headleSignUp}
                style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutLineText}>Register</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },

    inputContainer:{
        width:'80%',
    },

    input:{
        backgroundColor:'white',
        padding:15,
        borderRadius:10,
        marginTop:5,
    },
                        
    buttonContainer:{
        width:'60%',
        justifyContent:'center',
        alignItems:'center',
        marginTop:40,
    },

    button:{    
        backgroundColor:'#FF5500',
        width:'100%',
        padding: 15,
        borderRadius:10,
    },

    buttonText:{
        color:'white',
        fontWeight:'700',
        fontSize:16
    },

    buttonOutline:{
        backgroundColor:'white',
        marginTop:5,
        borderColor:'#FF5500',
        borderWidth:2
    },

    buttonOutLineText:{
        color:'#FF5500',
        fontWeight:'700',
        fontSize:16
    }

    
})