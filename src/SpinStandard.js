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
    { type: 'teddy',   img: teddy,   gif: teddyGif,   price: 15   },
    { type: 'gift',    img: gift,    gif: giftGif,    price: 25   },
    { type: 'flowers', img: flowers, gif: flowersGif, price: 50   },
    { type: 'trophy',  img: trophy,  gif: trophyGif,  price: 100  },
    { type: 'diamond', img: diamond, gif: diamondGif, price: 100  },
    { type: 'hat',     img: hat,     gif: hatGif,     price: '650+' },
];

const randomReward = () => rewards[Math.floor(Math.random() * rewards.length)];

export default function SpinStandard({ onBack }) {
    const [strip, setStrip] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [showGift, setShowGift] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [winner, setWinner] = useState(null);

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
            console.log('✅ Выпал:', winner);
        }, 4500);

        return () => clearTimeout(id);
    }, [spinning, strip, winner]);

    const invoiceHandlerRef = useRef(null);

    const startSpin = async () => {
        if (spinning) return;
        setSpinning(true);

        try {
            const res  = await fetch(
                'https://sapphiredrop.ansbackend.ch/generate-invoice',
                { method: 'POST', headers: { 'Content-Type': 'application/json' } }
            );
            const data = await res.json();
            if (!data.invoiceLink) throw new Error(data.error || 'No invoice link');

            let link = data.invoiceLink;
            if (!/^https?:\/\//i.test(link)) {
                link = link.startsWith('$')
                    ? `https://t.me/${link}`
                    : `https://t.me/invoice/${link}`;
            }

            if (!window.Telegram?.WebApp) {
                window.open(link, '_blank');
                setSpinning(false);
                return;
            }

            if (invoiceHandlerRef.current) {
                window.Telegram.WebApp.offEvent(
                    'invoiceClosed',
                    invoiceHandlerRef.current
                );
            }

            const onInvoiceClosed = async (event) => {
                window.Telegram.WebApp.offEvent('invoiceClosed', onInvoiceClosed);
                invoiceHandlerRef.current = null;

                if (event.status !== 'paid') {
                    setSpinning(false);
                    return;
                }

                const maxTries = 6;
                const pauseMs  = 800;
                let   reward   = null;

                for (let i = 0; i < maxTries; i++) {
                    try {
                        const r = await fetch(
                            `https://sapphiredrop.ansbackend.ch/get-gift?payload=${data.payload}`
                        );
                        if (r.ok) {
                            const j = await r.json();
                            if (j.reward) { reward = j.reward; break; }
                        }
                    } catch { /* network error */ }
                    await new Promise((ok) => setTimeout(ok, pauseMs));
                }

                if (!reward) {
                    console.warn('Reward not found yet');
                    setSpinning(false);
                    return;
                }

                const pick = rewards.find((r) => r.type === reward);
                if (!pick) { console.error('Unknown reward', reward); setSpinning(false); return; }

                setWinner(pick);
                const arr = Array.from({ length: 100 }, () => randomReward());
                arr[95] = pick;

                setStrip(arr);
                setShowGift(false);
            };

            invoiceHandlerRef.current = onInvoiceClosed;
            window.Telegram.WebApp.onEvent('invoiceClosed', onInvoiceClosed);

            window.Telegram.WebApp.openInvoice(link);
        } catch (err) {
            console.error('startSpin error:', err);
            setSpinning(false);
        }
    };

    const handleCloseModal = () => {
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
                {spinning ? 'Spinning…' : 'Unlock for 30'}
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
                        <p className="modal-text">Your gift has been sent to you</p>
                        <button onClick={handleCloseModal} className="try-again-btn">
                            Try again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
