import React, { Component } from 'react';
import slugify from 'slugify';
import config from '../../config';
import formatTime from '../../lib/formatTime' ;
import emptyPng from '../../assets/empty.png';

class Lister extends Component {
	constructor(props) {
		super(props);

		this.state = {
			itemData: props.data || [{}],
			toggleStatus: {},
			dayLabel: props.day
		};

		this.collapsable = this.collapsable.bind(this);
		this.canShare = !!window.navigator.share;
	}

	componentDidUpdate(prevProps) {
		if (this.props.data !== prevProps.data) {
			this.setState({ itemData: this.props.data });
		}
	}

	collapsable(id) {
		const data = Object.assign({}, this.state.toggleStatus, { [id]: this.state.toggleStatus[id] ? !this.state.toggleStatus[id] : true });
		this.setState({ toggleStatus: data });
	}

	shareItem(id, channelId, title, startTime, endTime, event) {
		event.stopPropagation();

		if (this.canShare) {
			const channelName = this.getChannelName(channelId);
			const formattedStartTime = formatTime(startTime);
			const formattedEndTime = formatTime(endTime);
			const titleSlug = slugify(title, { lower: true, strict: true, locale: 'nl' });

			navigator.share({
				title: `${title} ${this.state.dayLabel.toLowerCase()} op ${channelName} om ${formattedStartTime}`,
				text: `${title}\n${this.state.dayLabel} ${channelName}, ${formattedStartTime} - ${formattedEndTime}`,
				url: `${config.deepLink}/${titleSlug}/${id}`
			});
		}
	}

	getChannelName(channelId) {
		return config.channelInfo[channelId].label;
	}

	listItems(itemData) {
		return itemData.map((movie, index) => (
				<li key={ index } itemScope itemType="http://schema.org/Movie" className="movie-item" onClick={ this.collapsable.bind(this, movie.db_id) }>
					<div className="logo"><img src={ movie.ch_id ? config.api.channelLogoSrc.replace(/%s/g, movie.ch_id) : emptyPng } alt={  movie.ch_id ? this.getChannelName(movie.ch_id) : '' } /></div>
					<div className="movie-info">
						<div className="details">
							<h3 itemProp="name">{ movie.title }</h3>
							{ movie.s ? `${formatTime(movie.s)} - ${formatTime(movie.e)}` : '' }
						</div>
						<div className={`asset-details ${this.state.toggleStatus[movie.db_id] ? 'open' : '' }`}>
							{ movie.img && <div className="asset-image"><img itemProp="image" loading="lazy" src={ movie.img } alt={ movie.title } /></div> }
							<div className="synopsis">
								{ movie.prog_sort && <strong className="prefix-description">{ movie.prog_sort }</strong> }
								{ movie.descr ? <span dangerouslySetInnerHTML={{__html: movie.descr }}></span> : <br /> }
								<div className="meta-info">
									{ movie.rating &&
										<p className="rating" itemType="http://schema.org/AggregateRating" itemScope itemProp="aggregateRating">
											<strong>Waardering:</strong> <span itemProp="ratingValue">{ movie.rating } / 5.0</span>
											<span className="a11y-only"> / <span itemProp="bestRating">5</span></span>
											<span hidden itemProp="reviewCount">1</span>
										</p>
									}
									{ movie.year && <p><strong>Jaar:</strong> <span itemProp="dateCreated">{ movie.year }</span></p> }
									{ movie.dir && <p><strong>Regiseur:</strong> <span itemProp="director">{ movie.dir }</span></p> }
									{ movie.act && <p><strong>Acteurs:</strong> { movie.act }</p> }
									{ movie.scen && <p><strong>Scenario:</strong> { movie.scen }</p> }
									{ movie.comp && <p><strong>Componist:</strong> { movie.comp }</p> }
									{ movie.country && <p><strong>Land:</strong> { movie.country }</p> }
								</div>
							</div>
						</div>
						{ this.canShare && movie.title &&
							<button className="button-share" type="button" onClick={ this.shareItem.bind(this, movie.db_id, movie.ch_id, movie.title, movie.s, movie.e) }>
								<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><path d="M72 56c-4.813 0-9.12 2.137-12.054 5.501L39.643 51.35c.23-1.081.357-2.201.357-3.35s-.127-2.269-.357-3.349l20.303-10.152C62.879 37.864 67.187 40 72 40c8.836 0 16-7.164 16-16S80.836 8 72 8s-16 7.164-16 16c0 1.149.127 2.269.357 3.349L36.054 37.501C33.121 34.136 28.814 32 24 32c-8.836 0-16 7.164-16 16s7.164 16 16 16c4.814 0 9.12-2.137 12.054-5.501l20.304 10.152C56.127 69.731 56 70.851 56 72c0 8.836 7.164 16 16 16s16-7.164 16-16-7.164-16-16-16zm0-40a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM24 56a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm48 24a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/></svg>
								<span className="a11y-only">Delen</span>
							</button>
						}
					</div>
				</li>
			)
		);
	}

	render() {
		return (
			<ol>
				{ this.listItems(this.state.itemData) }
			</ol>
		);
	}
}

export default Lister;
