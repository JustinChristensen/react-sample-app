import { shallowEqual, useDispatch, useSelector } from 'react-redux';

export const usePropsOrState = (props, selector, propsEqual = shallowEqual) => {
    const dispatch = useDispatch();
    const nextProps = useSelector(s => ({
        ...selector(s, dispatch),
        ...props
    }), propsEqual);

    return nextProps;
};
