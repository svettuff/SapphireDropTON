import { useState, useRef, useEffect } from 'react';

import giftBox from './assets/gift-colored.webp';

import teddy from './assets/teddy.webp';
import gift from './assets/gift.webp';
import flowers from './assets/flowers.webp';
import trophy from './assets/trophy.webp';
import diamond from './assets/diamond.webp';
import hat from './assets/hat.webp';

import ton from "./assets/ton.webp";

import teddyGif from './gifs/teddy.gif';
import giftGif from './gifs/gift.gif';
import flowersGif from './gifs/flowers.gif';
import trophyGif from './gifs/trophy.gif';
import diamondGif from './gifs/diamond.gif';
import hatGif from './gifs/hat.gif';

const rewards = [
    { type: 'teddy',   img: teddy,   gif: teddyGif,   price: 0.08  },
    { type: 'gift',    img: gift,    gif: giftGif,    price: 0.13  },
    { type: 'flowers', img: flowers, gif: flowersGif, price: 0.25  },
    { type: 'trophy',  img: trophy,  gif: trophyGif,  price: 0.5  },
    { type: 'diamond', img: diamond, gif: diamondGif, price: 0.5  },
    { type: 'hat',     img: hat,     gif: hatGif,     price: '5+' },
];

const randomReward = () => rewards[Math.floor(Math.random() * rewards.length)];

export default function SpinStandard({ onBack }) {
    const [strip, setStrip] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [showGift, setShowGift] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [winner, setWinner] = useState(null);
    const [showBalanceErrorModal, setShowBalanceErrorModal] = useState(false);

    const reelRef = useRef(null);
    const maskRef = useRef(null);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg?.BackButton) return;

        tg.BackButton.show();
        tg.BackButton.onClick(onBack);

        return () => {
            tg.BackButton.offClick(onBack);
            tg.BackButton.hide();
        };
    }, [onBack]);

    useEffect(() => {
        if (!spinning || strip.length === 0) return;

        const targetEl = reelRef.current.children[95];
        const maskEl= maskRef.current;
        if (!targetEl || !maskEl) return;

        const targetRect = targetEl.getBoundingClientRect();
        const maskRect   = maskEl.getBoundingClientRect();

        const offset = (targetRect.left - maskRect.left)
            - (maskRect.width / 2 - targetRect.width / 2);

        requestAnimationFrame(() => {
            reelRef.current.style.transition = 'transform 4s cubic-bezier(.2,.8,.2,1)';
            reelRef.current.style.transform  = `translateX(-${offset}px)`;
        });

        const id = setTimeout(() => {
            setSpinning(false);
            reelRef.current.style.transition = 'none';
            reelRef.current.style.transform  = 'translateX(0)';
            setShowGift(true);
            setStrip([]);
            setShowModal(true);
            console.log('✅ Dropped:', winner);
        }, 4500);

        return () => clearTimeout(id);
    }, [spinning, strip, winner]);

    const startSpin = async () => {
        if (spinning) return;
        setSpinning(true);

        try {
            const tg = window.Telegram?.WebApp;
            if (!tg || !tg.initDataUnsafe?.user?.id) {
                throw new Error('Telegram user ID not found');
            }

            const userId = tg.initDataUnsafe.user.id;

            const res = await fetch(
                'https://sapphiredrop.ansbackend.ch/unlock-standard',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId }),
                }
            );

            if (res.status === 402) {
                setShowBalanceErrorModal(true);
                return;
            }

            const data = await res.json();

            if (!data.reward) {
                throw new Error(data.error || 'No reward received');
            }

            const { reward: rewardType, gift_id: giftId } = data;
            const pick = rewards.find((r) => r.type === rewardType);

            if (!pick) {
                console.error('Unknown reward:', rewardType);
                setSpinning(false);
                return;
            }

            setWinner({ ...pick, giftId });

            const arr = Array.from({ length: 100 }, () => randomReward());
            arr[95] = pick;

            setStrip(arr);
            setShowGift(false);
        } catch (err) {
            console.error('startSpin error:', err);
        }
    };

    const handleCloseErrorModal = () => {
        setSpinning(false);
        setShowBalanceErrorModal(false);
    };

    const handleSellGift = async (giftId) => {
        const tg = window.Telegram?.WebApp;
        const userId = tg?.initDataUnsafe?.user?.id;

        if (!userId || !giftId) return;

        await fetch('https://sapphiredrop.ansbackend.ch/sell-gift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, gift_id: giftId }),
        });

        setShowModal(false);
        setWinner(null);
    };

    const handleWithdrawGift = async (giftId) => {
        const tg = window.Telegram?.WebApp;
        const userId = tg?.initDataUnsafe?.user?.id;

        if (!userId || !giftId) return;

        await fetch('https://sapphiredrop.ansbackend.ch/withdraw-gift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, gift_id: giftId }),
        });

        setShowModal(false);
        setWinner(null);
    };

    return (
        <div className="spin-container">
            <div className="spin-gift-block">
                {showGift ? (
                    <>
                        <img src={giftBox} alt="box" className="gift-img" />
                        <h1 className="label">Unlock Standard</h1>
                    </>
                ) : (
                    <div className="roller-mask" ref={maskRef}>
                        <div className="roller-strip" ref={reelRef}>
                            {strip.map((r, i) => (
                                <img key={i} src={r.img} alt="" className="roller-img" />
                            ))}
                        </div>
                        <div className="roller-indicator" />
                    </div>
                )}
            </div>

            <button className="spin-button" onClick={startSpin} disabled={spinning}>
                {spinning ? 'Spinning…' : 'Unlock for 0.15'}
                {!spinning && (
                    <img src={ton} alt="ton" className="ton-icon-button" />
                )}
            </button>

            <div className="grid-rewards">
                {rewards.map((r, i) => (
                    <div key={i} className="reward-box">
                        <img src={r.gif} alt={r.type} className="reward-img" />
                        <div className="reward-price">
                            <img src={ton} alt="" className="ton-icon-reward" />{r.price}
                        </div>
                    </div>
                ))}
            </div>

            <p className="disclaimer">
                By unlocking the box, you acknowledge that each gift is subject to a predefined drop chance,
                and that delivery of out-of-stock items may be delayed.
            </p>

            {showModal && winner && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Congratulations!</h2>
                        <img src={winner.img} alt={winner.type} className="modal-img" />

                        <div className="modal-buttons">
                            <button className="try-again-btn" onClick={() => handleSellGift(winner.giftId)}>
                                Sell
                            </button>
                            <button className="try-again-btn" onClick={() => handleWithdrawGift(winner.giftId)}>
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBalanceErrorModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Insufficient Balance</h2>
                        <p className="modal-text">You need at least 0.15 TON.</p>
                        <button onClick={handleCloseErrorModal} className="try-again-btn">
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
