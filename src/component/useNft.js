import { ethers, Contract } from "ethers";
import { useEffect, useState } from "react";
import artifact from "../abi/nft.json";

export const useNft = () => {
    // NFT所有者情報
    // NFTのtokenId -> meta data -> image url
    const [nftSalePageInfo, setNftSalePageInfo]  = useState({
        tokenId: '',
        owner: ''
      });
    // metamaskを介してネットワークノードとの通信をするオブジェクトを作成する
    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
    // アドレス、ABI, プロバイダを指定してコントラクトオブジェクトを作成
    // コントラクトの状態を変化させる(gas代が必要な）操作をするためには場合はSignerを与える必要がある
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
    const signer = provider.getSigner();
    const nftContract = contract.connect(signer);

    useEffect(() => {
        const fetchData = async() => {
            //owner of の呼出し
            // 配列にする
            const owner = await nftContract.ownerOf(0)
            const tokenId = 0
            setNftSalePageInfo({tokenId: tokenId, owner: owner})
        };
        fetchData().catch((e) => console.log(e));
    }, []);
    return { nftSalePageInfo, setNftSalePageInfo };
}
