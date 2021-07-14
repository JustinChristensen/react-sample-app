import PropTypes from 'prop-types';
import { usePropsSelector, useT, useUid, useHandlers } from '../hooks';
import { compose, identity } from '../utils/fn.js';
import { actions } from '../reducers';
import { detectBrowserLocale, fetchMissingMessages } from '../lang.js';
import { classes } from '../utils/string.js';

export const defaultOnDropdownMenuKeyUp = e => {
    const maybeFocusItem = el => el && el.querySelector('.dropdown-item').focus();
    const li = e.target.closest('li');
    if (e.key === 'ArrowUp') maybeFocusItem(li.previousElementSibling);
    else if (e.key === 'ArrowDown') maybeFocusItem(li.nextElementSibling);
};

export const ApplyToProps = (name, fn, Component) => {
    const WrappedComponent = props => Component(fn(props));
    WrappedComponent.displayName = `ApplyToProps(${name})`;
    return WrappedComponent;
};

export const HeaderMenu = ApplyToProps('HeaderMenu', compose(
    useUid,
    useHandlers({ onDropdownMenuKeyUp: defaultOnDropdownMenuKeyUp })
), ({
    $uid,
    className,
    items,
    selectedItem,
    hoverText,
    onDropdownMenuKeyUp,
    onDropdownMenuClick,
    itemIdFn = identity,
    renderItem = identity
}) => {
    const unselectedItems = items.filter(p => itemIdFn(p) !== itemIdFn(selectedItem));
    const menuId = `header-menu-${$uid}`;
    const buttonClasses = classes => `${classes} btn py-3 px-4 text-white`;

    return (
        <div className={classes(className, 'header-menu dropdown d-inline-block')} title={hoverText}>
            <button className={buttonClasses('dropdown-toggle')} type="button" id={menuId} data-id={itemIdFn(selectedItem)}>
                {renderItem(selectedItem)}
            </button>
            <ul className="dropdown-menu dropdown-menu-dark py-0 start-0 end-0" aria-labelledby={menuId} onKeyUp={onDropdownMenuKeyUp}>
                {unselectedItems.map(item => (
                    <li key={itemIdFn(item)}>
                        <button className={buttonClasses('dropdown-item')} type="button" onClick={onDropdownMenuClick} data-id={itemIdFn(item)}>
                            {renderItem(item)}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
});

HeaderMenu.propTypes = {
    $uid: PropTypes.number,
    className: PropTypes.string,
    items: PropTypes.array,
    selectedItem: PropTypes.any,
    itemIdFn: PropTypes.func,
    hoverText: PropTypes.string,
    renderItem: PropTypes.func,
    onDropdownMenuKeyUp: PropTypes.func,
    onDropdownMenuClick: PropTypes.func
};

export const defaultOnSelectProfile = e => {
    e.preventDefault();

    e.$dispatch(actions.SELECT_PROFILE({
        id: Number(e.currentTarget.dataset.id),
        browserLocale: detectBrowserLocale()
    }));

    fetchMissingMessages(e.$getState, e.$dispatch);
};

export const defaultOnSelectLocale = e => {
    e.preventDefault();
    e.$dispatch(actions.SET_LOCALE({ locale: e.currentTarget.dataset.id }));
    fetchMissingMessages(e.$getState, e.$dispatch);
};

export const AppHeader = props => {
    const {
        $t,
        availableLocales,
        selectedLocale,
        onSelectLocale,
        profiles,
        selectedProfile,
        onSelectProfile
    } = compose(
        useT,
        usePropsSelector(s => ({
            availableLocales: s.availableLocales,
            selectedLocale: s.selectedProfile.locale,
            profiles: s.profiles,
            selectedProfile: s.selectedProfile,
        })),
        useHandlers({
            onSelectLocale: defaultOnSelectLocale,
            onSelectProfile: defaultOnSelectProfile
        })
    )(props);

    const flagClasses = loc => `flag-icon flag-icon-${loc}`;

    return (
        <header className="header container-fluid mb-4">
            <div className="row align-items-center">
                <div className="col">
                    <h2 className="logotype my-2">
                        <a className="text-white text-decoration-none">{$t('header.heading')}</a>
                    </h2>
                </div>

                <div className="col">
                    <div className="float-end">
                        <HeaderMenu className="locale-menu" items={availableLocales} selectedItem={selectedLocale}
                            hoverText={$t('header.localeMenu.hoverText')} onDropdownMenuClick={onSelectLocale} renderItem={locale => (
                                <span className={flagClasses(locale)}></span>
                            )} />
                        <HeaderMenu className="profile-menu" items={profiles} selectedItem={selectedProfile} itemIdFn={profile => profile.id}
                            hoverText={$t('header.profileMenu.hoverText')} onDropdownMenuClick={onSelectProfile} renderItem={profile => (
                                <>
                                    <i className="bi bi-person-circle"></i>
                                    <em className="ms-2 fst-normal">{profile.name}</em>
                                </>
                            )} />
                    </div>
                </div>
            </div>
        </header>
    );
};
