import { Connection, Keypair } from "@solana/web3.js";
import { 
  getOrca, 
  OrcaFarmConfig,
  OrcaPool,
  OrcaPoolConfig,
  Orca, 
  OrcaFarm, 
  Network 
} from "@orca-so/sdk";
import Decimal from "decimal.js";

const ETH_SOL = OrcaPoolConfig.ETH_SOL;
const ETH_SOL_AQ = OrcaFarmConfig.mSOL_SOL_AQ;
const ETH_SOL_DD = OrcaFarmConfig.mSOL_SOL_DD;

export class Stake {
  private _orca: Orca;
  private _wallet: Keypair;
  private _pool: OrcaPool;
  private _farm: OrcaFarm;
  private _ddFarm: OrcaFarm;
  constructor(wallet: Keypair, connection: Connection, type: string){
    this._wallet = wallet;
    if(type==='devnet'){
      this._orca = getOrca(connection, Network.DEVNET)
    } else {
      this._orca = getOrca(connection)
    }

    this._pool = this._orca.getPool(ETH_SOL)
    this._farm = this._orca.getFarm(ETH_SOL_AQ)
    this._ddFarm = this._orca.getFarm(ETH_SOL_DD)
  }

  async swap(amount: number): Promise<string>{
    const solToken = this._pool.getTokenB();
    const solAmount = new Decimal(amount);
    const quote = await this._pool.getQuote(solToken, solAmount);
    const ETHAmount = quote.getMinOutputAmount();

    console.log(`Swap ${solAmount.toString()} SOL for at least ${ETHAmount.toNumber()} ETH`);

    const swapPayload = await this._pool.swap(this._wallet, solToken, solAmount, ETHAmount);
    const swapTxId = await swapPayload.execute();
    return swapTxId;
  }

  async poolDeposit(amount: number): Promise<string>{
    const solToken = this._pool.getTokenB();
    const solAmount = new Decimal(amount);
    const quote = await this._pool.getQuote(solToken, solAmount);
    const ETHAmount = quote.getMinOutputAmount();
    const { maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut } = await this._pool.getDepositQuote(
      ETHAmount,
      solAmount
    );

    console.log(
      `Deposit at most ${maxTokenBIn.toNumber()} SOL and ${maxTokenAIn.toNumber()} ETH, for at least ${minPoolTokenAmountOut.toNumber()} LP tokens`
    );
    const poolDepositPayload = await this._pool.deposit(
      this._wallet,
      maxTokenAIn,
      maxTokenBIn,
      minPoolTokenAmountOut
    );
    const poolDepositTxId = await poolDepositPayload.execute();
    
    return poolDepositTxId;
  }

  async poolWithdraw(){
    const withdrawTokenAmount = await this._pool.getLPBalance(this._wallet.publicKey);
    const withdrawTokenMint = this._pool.getPoolTokenMint();
    const { maxPoolTokenAmountIn, minTokenAOut, minTokenBOut } = await this._pool.getWithdrawQuote(
      withdrawTokenAmount,
      withdrawTokenMint
    );

    console.log(
      `Withdraw at most ${maxPoolTokenAmountIn.toNumber()} ETH_SOL LP token for at least ${minTokenAOut.toNumber()} ORCA and ${minTokenBOut.toNumber()} SOL`
    );
    const poolWithdrawPayload = await this._pool.withdraw(
      this._wallet,
      maxPoolTokenAmountIn,
      minTokenAOut,
      minTokenBOut
    );
    const poolWithdrawTxId = await poolWithdrawPayload.execute();
    
    return poolWithdrawTxId
  }

  async poolBalance(): Promise<number>{
    const lpBalance = await this._pool.getLPBalance(this._wallet.publicKey);

    return lpBalance.toNumber()
  }

  async farmDeposit(): Promise<string>{
    const lpBalance = await this._pool.getLPBalance(this._wallet.publicKey);
    const farmDepositPayload = await this._farm.deposit(this._wallet, lpBalance);
    //
    const farmDepositTxId = await farmDepositPayload.execute();
    return farmDepositTxId;
  }

  async farmDoubleDipDeposit(): Promise<string> {
    const farmBalance = await this._farm.getFarmBalance(this._wallet.publicKey);
    const farmDepositPayload = await this._ddFarm.deposit(this._wallet, farmBalance);
    //
    const farmDepositTxId = await farmDepositPayload.execute();
    return farmDepositTxId;
  }

  async farmBalance(): Promise<number>{
    const farmBalance = await this._farm.getFarmBalance(this._wallet.publicKey)

    return farmBalance.toNumber()
  }

  async harvestReward(): Promise<string>{
    const rewardPayload = await this._farm.harvest(this._wallet)
    const farmRewardTxId = await rewardPayload.execute();
    return farmRewardTxId;
  }

  async harvestableAmount(): Promise<number>{
    const amount = await this._farm.getHarvestableAmount(this._wallet.publicKey)
    return amount.toNumber();
  }

  async farmWithdraw(): Promise<string>{
    // withdraw all balance
    const farmBalance = await this._farm.getFarmBalance(this._wallet.publicKey)
    const farmWithdrawPayload = await this._farm.withdraw(this._wallet, farmBalance);
    const farmWithdrawTxId = await farmWithdrawPayload.execute();
    
    return farmWithdrawTxId;
  }
}