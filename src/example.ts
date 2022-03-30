import { readFile } from "mz/fs";
import { Connection, Keypair } from "@solana/web3.js";
import {Stake} from './stake'

// https://gist.github.com/rawfalafel/19447c7d8f819227cfd657c5b43462f6

(async ()=>{
  const secretKeyString = await readFile("./keypair.json", {
    encoding: "utf8",
  });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const owner = Keypair.fromSecretKey(secretKey);
  // console.log(owner.publicKey.toString())
  const connection = new Connection("https://api.devnet.solana.com", "singleGossip");

  const stake = new Stake(owner, connection, 'devnet')

  // const hash = await stake.swap(1)
  // console.log(hash)

  // const deposit = await stake.poolDeposit(1)
  // console.log(deposit)

  const balance = await stake.poolBalance()
  console.log(balance)

  // const tx = await stake.poolWithdraw()
  // console.log(tx)

  // const lastBalance = await stake.poolBalance()
  // console.log(lastBalance)

  // const farmtx = await stake.farmDeposit()
  // console.log(farmtx)

  
  // const farmBalance = await stake.farmBalance()
  // console.log("befor WithDraw: ", farmBalance)

  // const farmWithdraw = await stake.farmWithdraw()
  // console.log("withDraw TX: ", farmWithdraw)

  // const lastfarmBalance = await stake.farmBalance()
  // console.log("after withdraw: ", lastfarmBalance)

  // const pbalance = await stake.poolBalance()
  // console.log("Pool balance: ", pbalance)




  
})()