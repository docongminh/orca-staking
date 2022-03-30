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

  // SWAP SOL->mSOL
  console.log("SWAP SOL->ETH")
  const hash = await stake.swap(1)
  console.log("Swap ETH->SOL tx: ", hash)
  console.log("------------------------")
  console.log()
  // // Deposit ETH_SOL to Pool
  // const deposit = await stake.poolDeposit(1)
  // console.log(deposit)
  // console.log("------------------------")
  // console.log()
  // // Get pool balance
  // const balance = await stake.poolBalance()
  // console.log("Pool Balance: ", balance)
  // console.log("------------------------")
  // console.log()
  // // Farm deposit ETH_SOL LP token for farm token
  // const farmtx = await stake.farmDeposit()
  // console.log("Farm deposit tx: ", farmtx)
  // const farmBalance = await stake.farmBalance()
  // console.log("Farm balance: ", farmBalance)
  // console.log("------------------------")
  // console.log()
  // // Double Dip
  // const ddFarm = await stake.farmDoubleDipDeposit()
  // console.log("Double dip tx: ", ddFarm)
  // const ddfarmBalance = await stake.farmBalance()
  // console.log("DD Farm balance: ", ddfarmBalance)

})()